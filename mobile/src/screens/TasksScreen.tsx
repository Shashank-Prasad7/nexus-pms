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
import { Project, Task, TaskPriority, TaskStatus } from '../types';

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal create/edit state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const [taskRes, projectRes] = await Promise.all([
        mobileApi.getTasks({
          search: search.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        }),
        mobileApi.getProjects(),
      ]);

      if (taskRes.success && taskRes.data) {
        setTasks(taskRes.data);
      }
      if (projectRes.success && projectRes.data) {
        setProjects(projectRes.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await mobileApi.updateTask(task.id, { status: newStatus });
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update task');
    }
  };

  const handleOpenCreate = () => {
    if (projects.length === 0) {
      Alert.alert('Notice', 'Please create a project first before creating tasks.');
      return;
    }
    setEditingTask(null);
    setName('');
    setDescription('');
    setSelectedProjectId(projects[0].id);
    setPriority('MEDIUM');
    setStatus('PENDING');
    setDueDate('');
    setModalVisible(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setName(task.name);
    setDescription(task.description || '');
    setSelectedProjectId(task.projectId);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Task name is required');
      return;
    }
    if (!selectedProjectId) {
      Alert.alert('Validation Error', 'Please select a project');
      return;
    }

    try {
      setSaving(true);
      if (editingTask) {
        await mobileApi.updateTask(editingTask.id, {
          name: name.trim(),
          description: description.trim() || null,
          projectId: selectedProjectId,
          priority,
          status,
          dueDate: dueDate ? dueDate : null,
        });
      } else {
        await mobileApi.createTask({
          name: name.trim(),
          description: description.trim() || undefined,
          projectId: selectedProjectId,
          priority,
          status,
          dueDate: dueDate ? dueDate : null,
        });
      }
      setModalVisible(false);
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await mobileApi.deleteTask(task.id);
            fetchTasks();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete task');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
          <Text style={styles.addButtonText}>+ Task</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips: Status and Priority */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Status:</Text>
        {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, statusFilter === s && styles.chipActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
              {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Prog' : s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.filterRow, { paddingTop: 0 }]}>
        <Text style={styles.filterLabel}>Priority:</Text>
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, priorityFilter === p && styles.chipActive]}
            onPress={() => setPriorityFilter(p)}
          >
            <Text style={[styles.chipText, priorityFilter === p && styles.chipTextActive]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No Tasks Found</Text>
          <Text style={styles.emptySubtitle}>Tap "+ Task" to add your deliverables</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardMain}>
                {/* 1-touch Checkbox Toggle */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    item.status === 'COMPLETED' && styles.checkboxChecked,
                  ]}
                  onPress={() => handleToggleComplete(item)}
                >
                  {item.status === 'COMPLETED' && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      item.status === 'COMPLETED' && styles.taskTitleCompleted,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text style={styles.taskDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text style={styles.projectTag}>{item.project?.name || 'Project'}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <View
                    style={[
                      styles.badge,
                      item.priority === 'HIGH' ? styles.badgeHigh : styles.badgeMed,
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.priority}</Text>
                  </View>
                  {item.dueDate ? (
                    <Text style={styles.dateText}>
                      📅 {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => handleOpenEdit(item)}>
                    <Text style={styles.editAction}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteAction}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Task Create/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'New Task'}</Text>

            <View style={{ gap: 12, marginTop: 14 }}>
              <View>
                <Text style={styles.fieldLabel}>Task Name *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Write unit tests"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text style={styles.fieldLabel}>Project *</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {projects.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chip, selectedProjectId === p.id && styles.chipActive]}
                      onPress={() => setSelectedProjectId(p.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedProjectId === p.id && styles.chipTextActive,
                        ]}
                      >
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>Priority</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((pr) => (
                    <TouchableOpacity
                      key={pr}
                      style={[styles.chip, priority === pr && styles.chipActive]}
                      onPress={() => setPriority(pr)}
                    >
                      <Text style={[styles.chipText, priority === pr && styles.chipTextActive]}>
                        {pr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>Status</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
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

              <View>
                <Text style={styles.fieldLabel}>Due Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="2026-12-31"
                  placeholderTextColor="#64748b"
                  value={dueDate}
                  onChangeText={setDueDate}
                />
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
                    {editingTask ? 'Save Changes' : 'Create Task'}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 6,
  },
  filterLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    paddingTop: 8,
    gap: 10,
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardMain: {
    flexDirection: 'row',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  taskTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  taskTitleCompleted: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  taskDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  projectTag: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  badgeMed: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
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
});
