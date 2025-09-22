import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { BookFairy } from './BookFairy';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { user, updateUserProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [hardcoverKey, setHardcoverKey] = useState(user?.hardcoverApiKey || '');
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleUpdateHardcoverKey = async () => {
    if (!hardcoverKey.trim()) {
      alert('Please enter a valid API key, sugar!');
      return;
    }

    setIsUpdatingKey(true);
    try {
      await updateUserProfile({ hardcoverApiKey: hardcoverKey });
      setShowKeyInput(false);
      alert('API key updated successfully!');
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('Oops! Something went wrong updating your API key.');
    } finally {
      setIsUpdatingKey(false);
    }
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('bookfairy_last_onboarding');
    alert('Onboarding reset! You\'ll see the setup flow on next visit.');
  };

  const maskApiKey = (key: string) => {
    if (!key) return 'Not set';
    return `${key.substring(0, 8)}${'*'.repeat(Math.max(0, key.length - 8))}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-lg bg-white/20 hover:bg-white/30"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Fairy Guide */}
      <div className="fairy-card p-6 mb-6">
        <BookFairy 
          message="Well hey there, sugar! Let's get your BookFairy experience customized just the way you like it!"
          mood="playful"
        />
      </div>

      {/* User Profile */}
      <div className="fairy-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="p-3 bg-white/20 rounded-lg text-sm">
              {user?.email}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="p-3 bg-white/20 rounded-lg text-sm">
              {user?.name}
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="fairy-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Hardcover API Key</label>
            {!showKeyInput ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-white/20 rounded-lg text-sm font-mono">
                  {maskApiKey(user?.hardcoverApiKey || '')}
                </div>
                <button 
                  onClick={() => setShowKeyInput(true)}
                  className="fairy-button text-sm"
                >
                  Update
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={hardcoverKey}
                  onChange={(e) => setHardcoverKey(e.target.value)}
                  placeholder="Enter your Hardcover API key"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white/80"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleUpdateHardcoverKey}
                    disabled={isUpdatingKey}
                    className="fairy-button text-sm"
                  >
                    {isUpdatingKey ? 'Updating...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => setShowKeyInput(false)}
                    className="text-sm px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Audiobookshelf Account</label>
            <div className="p-3 bg-white/20 rounded-lg text-sm">
              {user?.audiobookshelfCreated ? 
                '✅ Account created and configured' : 
                '⏳ Will be created on first download'
              }
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="fairy-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">App Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm opacity-70">
                Current: {theme === 'day' ? 'Summer Meadow' : 'Enchanted Twilight'}
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="fairy-button text-sm"
            >
              {theme === 'day' ? '🌙 Night' : '☀️ Day'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notifications</div>
              <div className="text-sm opacity-70">Push notifications for downloads</div>
            </div>
            <div className="text-sm px-3 py-1 bg-green-500/20 text-green-700 rounded-full">
              {Notification.permission === 'granted' ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="fairy-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">App Information</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>PWA Installed</span>
            <span>{window.matchMedia('(display-mode: standalone)').matches ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Onboarding</span>
            <span>
              {localStorage.getItem('bookfairy_last_onboarding') ? 
                new Date(parseInt(localStorage.getItem('bookfairy_last_onboarding')!)).toLocaleDateString() :
                'Never'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Debug Actions */}
      <div className="fairy-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Debug & Testing</h2>
        
        <div className="space-y-3">
          <button 
            onClick={handleResetOnboarding}
            className="w-full p-3 bg-yellow-500/20 text-yellow-700 rounded-lg hover:bg-yellow-500/30"
          >
            Reset Onboarding Flow
          </button>
          
          <button 
            onClick={() => {
              localStorage.clear();
              alert('Local storage cleared!');
            }}
            className="w-full p-3 bg-orange-500/20 text-orange-700 rounded-lg hover:bg-orange-500/30"
          >
            Clear Local Storage
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="text-center">
        <button 
          onClick={signOut}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-xs opacity-50">
        <p>Made with magic and Southern charm 🧚‍♀️</p>
        <p>BookFairy © 2024</p>
      </div>
    </div>
  );
}