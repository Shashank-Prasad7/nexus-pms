import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { mobileApi } from '../api/client';
import { DashboardData } from '../types';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen: React.FC<{ onNavigateToTasks: () => void }> = ({
  onNavigateToTasks,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const res = await mobileApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading dashboard metrics...</Text>
      </View>
    );
  }

  const m = data?.metrics || {
    totalProjects: 0,
    projectsInProgress: 0,
    projectsCompleted: 0,
    projectsNotStarted: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      {/* Welcome Bar */}
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>Hello, {user?.name || 'Explorer'} 👋</Text>
        <Text style={styles.welcomeSubtitle}>Here is your live project progress overview</Text>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        {/* Total Projects */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Projects</Text>
          <Text style={styles.kpiValue}>{m.totalProjects}</Text>
          <Text style={styles.kpiSub}>{m.projectsInProgress} In Progress • {m.projectsCompleted} Done</Text>
        </View>

        {/* Total Tasks */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Tasks</Text>
          <Text style={styles.kpiValue}>{m.totalTasks}</Text>
          <Text style={styles.kpiSub}>Completion: {m.completionRate}%</Text>
        </View>

        {/* Completed Tasks */}
        <View style={[styles.kpiCard, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
          <Text style={[styles.kpiLabel, { color: '#10b981' }]}>Completed Tasks</Text>
          <Text style={[styles.kpiValue, { color: '#10b981' }]}>{m.completedTasks}</Text>
          <Text style={styles.kpiSub}>Deliverables finished</Text>
        </View>

        {/* Pending Tasks */}
        <View style={[styles.kpiCard, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
          <Text style={[styles.kpiLabel, { color: '#f59e0b' }]}>Pending Tasks</Text>
          <Text style={[styles.kpiValue, { color: '#f59e0b' }]}>{m.pendingTasks}</Text>
          <Text style={styles.kpiSub}>Awaiting action</Text>
        </View>

        {/* Projects In Progress */}
        <View style={[styles.kpiCard, { width: '100%', borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
          <Text style={[styles.kpiLabel, { color: '#3b82f6' }]}>Active Projects In Progress</Text>
          <Text style={[styles.kpiValue, { color: '#3b82f6' }]}>{m.projectsInProgress}</Text>
          <Text style={styles.kpiSub}>Currently underway</Text>
        </View>
      </View>

      {/* Recent Projects */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Projects</Text>
      </View>

      {(!data?.recentProjects || data.recentProjects.length === 0) ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No projects created yet.</Text>
        </View>
      ) : (
        data.recentProjects.map((p) => (
          <View key={p.id} style={styles.projectItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.projectName}>{p.name}</Text>
              <Text style={styles.projectStatus}>{p.status.replace('_', ' ')}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${p.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {p.completedTasks}/{p.totalTasks} Tasks Done ({p.progress}%)
            </Text>
          </View>
        ))
      )}

      {/* Upcoming Action Items */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        <TouchableOpacity onPress={onNavigateToTasks}>
          <Text style={styles.sectionLink}>View All Tasks →</Text>
        </TouchableOpacity>
      </View>

      {(!data?.upcomingTasks || data.upcomingTasks.length === 0) ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No pending tasks. You are all caught up!</Text>
        </View>
      ) : (
        data.upcomingTasks.map((t) => (
          <View key={t.id} style={styles.taskItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskName}>{t.name}</Text>
              <Text style={styles.taskMeta}>
                {t.project?.name || 'Project'}
                {t.dueDate ? ` • Due ${new Date(t.dueDate).toLocaleDateString()}` : ''}
              </Text>
            </View>
            <View style={[styles.priorityBadge, t.priority === 'HIGH' ? styles.priorityHigh : styles.priorityMed]}>
              <Text style={styles.priorityText}>{t.priority}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  welcomeSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  kpiLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  kpiValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    marginVertical: 4,
  },
  kpiSub: {
    color: '#64748b',
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#131b2e',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  projectItem: {
    backgroundColor: '#131b2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  projectName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  projectStatus: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#090d16',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  taskItem: {
    backgroundColor: '#131b2e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  taskName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  taskMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  priorityMed: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
});
