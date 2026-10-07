import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { TasksScreen } from './src/screens/TasksScreen';

function MainApp() {
  const { user, loading, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'tasks'>('dashboard');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Connecting to Nexus PMS...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d121f" />

      {/* Top Mobile Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <View>
            <Text style={styles.topBarTitle}>Nexus PMS</Text>
            <Text style={styles.topBarSub}>Mobile Workspace</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main View Area */}
      <View style={styles.viewArea}>
        {currentTab === 'dashboard' ? (
          <DashboardScreen onNavigateToTasks={() => setCurrentTab('tasks')} />
        ) : currentTab === 'projects' ? (
          <ProjectsScreen />
        ) : (
          <TasksScreen />
        )}
      </View>

      {/* Bottom Navigation Tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navTab, currentTab === 'dashboard' && styles.navTabActive]}
          onPress={() => setCurrentTab('dashboard')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navLabel, currentTab === 'dashboard' && styles.navLabelActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, currentTab === 'projects' && styles.navTabActive]}
          onPress={() => setCurrentTab('projects')}
        >
          <Text style={styles.navIcon}>📁</Text>
          <Text style={[styles.navLabel, currentTab === 'projects' && styles.navLabelActive]}>
            Projects
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, currentTab === 'tasks' && styles.navTabActive]}
          onPress={() => setCurrentTab('tasks')}
        >
          <Text style={styles.navIcon}>✓</Text>
          <Text style={[styles.navLabel, currentTab === 'tasks' && styles.navLabelActive]}>
            Tasks
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0d121f',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  topBarTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  topBarSub: {
    color: '#64748b',
    fontSize: 10,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#131b2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  viewArea: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0d121f',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navTabActive: {
    borderTopColor: '#6366f1',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#6366f1',
  },
});
