import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { mobileApi } from '../api/client';
import { Project, ProjectStatus } from '../types';

export const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal create/edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('NOT_STARTED');
  const [saving, setSaving] = useState(false);

  // Detail View Modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await mobileApi.getProjects({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setStatus('NOT_STARTED');
    setModalVisible(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || '');
    setStatus(project.status);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Project name is required');
      return;
    }
    try {
      setSaving(true);
      if (editingProject) {
        await mobileApi.updateProject(editingProject.id, {
          name: name.trim(),
          description: description.trim() || null,
          status,
        });
      } else {
        await mobileApi.createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        });
      }
      setModalVisible(false);
      fetchProjects();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}" and all its tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.deleteProject(project.id);
              fetchProjects();
              if (selectedProject?.id === project.id) setSelectedProject(null);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const openProjectDetails = async (id: string) => {
    try {
      const res = await mobileApi.getProjectById(id);
      if (res.success && res.data) {
        setSelectedProject(res.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load details');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search & Actions Bar */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
          <Text style={styles.addButtonText}>+ Project</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.chipRow}>
        {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, statusFilter === s && styles.chipActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No Projects Found</Text>
          <Text style={styles.emptySubtitle}>Tap "+ Project" above to create one</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openProjectDetails(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={[styles.badge, getStatusStyle(item.status)]}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>

              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {/* Progress bar */}
              <View style={styles.progressWrap}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${item.taskStats?.progressPercentage || 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {item.taskStats?.completed || 0}/{item.taskStats?.total || 0} Tasks Done (
                  {item.taskStats?.progressPercentage || 0}%)
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'No date'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => handleOpenEdit(item)}>
                    <Text style={styles.editAction}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteAction}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Project Detail Modal */}
      <Modal visible={!!selectedProject} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>{selectedProject?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedProject(null)}>
                <Text style={{ color: '#94a3b8', fontSize: 18, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94a3b8', fontSize: 13, marginVertical: 8 }}>
              {selectedProject?.description || 'No description provided.'}
            </Text>

            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14, marginTop: 12, marginBottom: 8 }}>
              Tasks under this project ({selectedProject?.tasks?.length || 0})
            </Text>

            <FlatList
              data={selectedProject?.tasks || []}
              keyExtractor={(t) => t.id}
              ListEmptyComponent={
                <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginVertical: 16 }}>
                  No tasks under this project.
                </Text>
              }
              renderItem={({ item: task }) => (
                <View style={styles.nestedTaskItem}>
                  <Text
                    style={{
                      color: task.status === 'COMPLETED' ? '#64748b' : '#ffffff',
                      textDecorationLine: task.status === 'COMPLETED' ? 'line-through' : 'none',
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {task.name}
                  </Text>
                  <Text style={{ color: '#06b6d4', fontSize: 11 }}>{task.status}</Text>
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 16 }]}
              onPress={() => setSelectedProject(null)}
            >
              <Text style={styles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create / Edit Project Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProject ? 'Edit Project' : 'New Project'}
            </Text>

            <View style={{ gap: 12, marginTop: 14 }}>
              <View>
                <Text style={styles.fieldLabel}>Project Name *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Mobile App Redesign"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Overview of project scope..."
                  placeholderTextColor="#64748b"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View>
                <Text style={styles.fieldLabel}>Status</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[styles.chip, status === st && styles.chipActive]}
                      onPress={() => setStatus(st)}
                    >
                      <Text style={[styles.chipText, status === st && styles.chipTextActive]}>
                        {st.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.chip, { paddingHorizontal: 16 }]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.chipText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { paddingHorizontal: 20 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {editingProject ? 'Save Changes' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStatusStyle = (status: ProjectStatus) => {
  switch (status) {
    case 'COMPLETED':
      return { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
    case 'IN_PROGRESS':
      return { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
    default:
      return { backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  topBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#131b2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#131b2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: '#6366f1',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  progressWrap: {
    marginVertical: 10,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#090d16',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateText: {
    color: '#64748b',
    fontSize: 11,
  },
  editAction: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteAction: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  fieldLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  nestedTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#090d16',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
});
