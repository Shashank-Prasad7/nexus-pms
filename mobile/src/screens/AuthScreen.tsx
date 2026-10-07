import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, setApiBaseUrl } from '../api/client';

export const AuthScreen: React.FC = () => {
  const { login, register, sessionMessage, clearSessionMessage } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server URL configuration modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(API_BASE_URL);

  const handleSubmit = async () => {
    setError(null);
    clearSessionMessage();

    if (!email.trim() || !password) {
      setError('Please provide email and password');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Full Name is required for registration');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    setIsLogin(true);
    setEmail('demo@example.com');
    setPassword('Password123!');
    setError(null);
  };

  const handleSaveApiUrl = () => {
    setApiBaseUrl(customUrl.trim());
    setConfigModalOpen(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.title}>Nexus PMS</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to access your projects' : 'Create your cross-platform account'}
          </Text>
        </View>

        {/* Expired / Error Banner */}
        {(sessionMessage || error) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{sessionMessage || error}</Text>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLogin && styles.tabButtonActive]}
            onPress={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
            onPress={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Alex Johnson"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="alex@example.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isLogin ? 'Sign In to Workspace' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Fast Fill */}
        <TouchableOpacity style={styles.demoButton} onPress={handleAutofillDemo}>
          <Text style={styles.demoButtonText}>⚡ Autofill Demo Credentials</Text>
        </TouchableOpacity>

        {/* Server Config Link */}
        <TouchableOpacity style={styles.configLink} onPress={() => setConfigModalOpen(true)}>
          <Text style={styles.configLinkText}>⚙️ Backend URL: {API_BASE_URL}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Backend URL Modal */}
      <Modal visible={configModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure API Backend URL</Text>
            <Text style={styles.modalSubtitle}>
              Android emulator: http://10.0.2.2:5000/api{'\n'}
              Physical phone: http://YOUR_PC_LAN_IP:5000/api{'\n'}
              Deployed backend: https://your-backend.domain/api
            </Text>
            <TextInput
              style={[styles.input, { marginTop: 12, marginBottom: 16 }]}
              value={customUrl}
              onChangeText={setCustomUrl}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity
                style={[styles.tabButton, { paddingHorizontal: 16 }]}
                onPress={() => setConfigModalOpen(false)}
              >
                <Text style={styles.tabText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { paddingHorizontal: 20 }]}
                onPress={handleSaveApiUrl}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#131b2e',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#1a243d',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoButton: {
    alignItems: 'center',
    marginTop: 18,
    padding: 8,
  },
  demoButtonText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '600',
  },
  configLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  configLinkText: {
    color: '#64748b',
    fontSize: 11,
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
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
});
