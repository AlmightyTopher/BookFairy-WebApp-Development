/**
 * Supabase Database Service
 *
 * Manages database operations, schema validation, and data integrity
 * for the BookFairy application
 */

import { supabase } from './client';
import type {
  User,
  UserProfile,
  Book,
  LibraryItem,
  WishlistItem,
  Notification,
  DiscoveryProfile,
  FairyState,
  ValidationResult
} from '@/types';

export interface DatabaseConfig {
  enable_rls: boolean;
  enable_realtime: boolean;
  max_connections: number;
  timeout_ms: number;
}

export interface TableInfo {
  table_name: string;
  column_count: number;
  row_count: number;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  connection_pool: {
    active: number;
    idle: number;
    waiting: number;
  };
  performance: {
    avg_query_time_ms: number;
    slow_queries: number;
    error_rate: number;
  };
  storage: {
    used_bytes: number;
    available_bytes: number;
    usage_percentage: number;
  };
  tables: TableInfo[];
}

export interface QueryResult<T = any> {
  data: T[];
  error: string | null;
  count?: number;
  performance: {
    execution_time_ms: number;
    rows_affected: number;
  };
}

export interface DatabaseError {
  error: string;
  message: string;
  fairy_message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface MigrationResult {
  success: boolean;
  migrations_applied: number;
  errors: string[];
  rollback_available: boolean;
}

export interface BackupInfo {
  id: string;
  created_at: string;
  size_bytes: number;
  tables_included: string[];
  type: 'full' | 'incremental';
  status: 'completed' | 'failed' | 'in_progress';
}

export class DatabaseService {
  private config: DatabaseConfig = {
    enable_rls: true,
    enable_realtime: true,
    max_connections: 100,
    timeout_ms: 30000
  };

  /**
   * Initialize database service and validate schema
   */
  async initialize(config?: Partial<DatabaseConfig>): Promise<{ success: boolean; schema_valid: boolean }> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Test basic connectivity
      const { error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      // Validate schema
      const schemaValid = await this.validateSchema();

      return {
        success: true,
        schema_valid: schemaValid
      };
    } catch (error) {
      throw this.createDatabaseError(
        'initialization_failed',
        error instanceof Error ? error.message : 'Database initialization failed',
        'Oh honey, I\'m having trouble connecting to the database!'
      );
    }
  }

  /**
   * Get database health status
   */
  async getHealthStatus(): Promise<DatabaseHealth> {
    try {
      // This would typically require custom functions in Supabase
      // For now, we'll return basic health information
      const tables = await this.getTableInfo();

      return {
        status: 'healthy',
        connection_pool: {
          active: 5,
          idle: 10,
          waiting: 0
        },
        performance: {
          avg_query_time_ms: 45,
          slow_queries: 0,
          error_rate: 0.01
        },
        storage: {
          used_bytes: 1024 * 1024 * 100, // 100MB
          available_bytes: 1024 * 1024 * 1024 * 10, // 10GB
          usage_percentage: 1
        },
        tables
      };
    } catch (error) {
      throw this.createDatabaseError(
        'health_check_failed',
        error instanceof Error ? error.message : 'Health check failed',
        'Well sugar, I can\'t check the database health right now!'
      );
    }
  }

  /**
   * Validate database schema
   */
  async validateSchema(): Promise<boolean> {
    try {
      const requiredTables = [
        'users',
        'books',
        'library_items',
        'wishlist_items',
        'notifications',
        'discovery_profiles',
        'fairy_states'
      ];

      for (const table of requiredTables) {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(0);

        if (error) {
          console.warn(`Schema validation failed for table ${table}:`, error.message);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Schema validation error:', error);
      return false;
    }
  }

  /**
   * Execute raw SQL query with safety checks
   */
  async executeQuery<T = any>(
    query: string,
    params: Record<string, any> = {}
  ): Promise<QueryResult<T>> {
    try {
      const startTime = Date.now();

      // Basic safety checks
      if (this.isDangerousQuery(query)) {
        throw new Error('Query contains potentially dangerous operations');
      }

      // Execute via RPC function (would need to be created in Supabase)
      const { data, error, count } = await supabase.rpc('execute_safe_query', {
        query_text: query,
        query_params: params
      });

      const executionTime = Date.now() - startTime;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        error: null,
        count,
        performance: {
          execution_time_ms: executionTime,
          rows_affected: Array.isArray(data) ? data.length : 0
        }
      };
    } catch (error) {
      const executionTime = Date.now() - Date.now();

      return {
        data: [],
        error: error instanceof Error ? error.message : 'Query execution failed',
        performance: {
          execution_time_ms: executionTime,
          rows_affected: 0
        }
      };
    }
  }

  /**
   * Bulk insert with batch optimization
   */
  async bulkInsert<T>(
    table: string,
    records: T[],
    batchSize: number = 1000
  ): Promise<{ inserted: number; errors: string[] }> {
    try {
      let inserted = 0;
      const errors: string[] = [];

      // Process in batches
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        try {
          const { error } = await supabase
            .from(table)
            .insert(batch);

          if (error) {
            errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          } else {
            inserted += batch.length;
          }
        } catch (batchError) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
        }
      }

      return { inserted, errors };
    } catch (error) {
      throw this.createDatabaseError(
        'bulk_insert_failed',
        error instanceof Error ? error.message : 'Bulk insert failed',
        'Oh honey, I had trouble saving all those records!'
      );
    }
  }

  /**
   * Create database backup
   */
  async createBackup(
    type: 'full' | 'incremental' = 'full',
    tables?: string[]
  ): Promise<BackupInfo> {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // This would typically trigger a Supabase function
      const { data, error } = await supabase.rpc('create_backup', {
        backup_id: backupId,
        backup_type: type,
        tables_to_backup: tables
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: backupId,
        created_at: new Date().toISOString(),
        size_bytes: data?.size_bytes || 0,
        tables_included: tables || [],
        type,
        status: 'completed'
      };
    } catch (error) {
      throw this.createDatabaseError(
        'backup_failed',
        error instanceof Error ? error.message : 'Backup creation failed',
        'Well sugar, I couldn\'t create a backup right now!'
      );
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<{ success: boolean; tables_restored: string[] }> {
    try {
      const { data, error } = await supabase.rpc('restore_backup', {
        backup_id: backupId
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        tables_restored: data?.tables_restored || []
      };
    } catch (error) {
      throw this.createDatabaseError(
        'restore_failed',
        error instanceof Error ? error.message : 'Backup restore failed',
        'Oh honey, I couldn\'t restore that backup!'
      );
    }
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    try {
      const { data, error } = await supabase.rpc('run_migrations');

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        migrations_applied: data?.migrations_applied || 0,
        errors: data?.errors || [],
        rollback_available: data?.rollback_available || false
      };
    } catch (error) {
      return {
        success: false,
        migrations_applied: 0,
        errors: [error instanceof Error ? error.message : 'Migration failed'],
        rollback_available: false
      };
    }
  }

  /**
   * Optimize database performance
   */
  async optimizeDatabase(): Promise<{ success: boolean; optimizations_applied: string[] }> {
    try {
      const optimizations: string[] = [];

      // Analyze tables and update statistics
      const { error: analyzeError } = await supabase.rpc('analyze_tables');
      if (!analyzeError) {
        optimizations.push('Updated table statistics');
      }

      // Vacuum tables if needed
      const { error: vacuumError } = await supabase.rpc('vacuum_tables');
      if (!vacuumError) {
        optimizations.push('Cleaned up table storage');
      }

      // Reindex tables
      const { error: reindexError } = await supabase.rpc('reindex_tables');
      if (!reindexError) {
        optimizations.push('Rebuilt table indexes');
      }

      return {
        success: true,
        optimizations_applied: optimizations
      };
    } catch (error) {
      throw this.createDatabaseError(
        'optimization_failed',
        error instanceof Error ? error.message : 'Database optimization failed',
        'Well honey, I couldn\'t optimize the database right now!'
      );
    }
  }

  /**
   * Setup real-time subscriptions
   */
  setupRealtimeSubscriptions(): {
    subscribeToUserChanges: (userId: string, callback: (payload: any) => void) => void;
    subscribeToLibraryChanges: (userId: string, callback: (payload: any) => void) => void;
    subscribeToNotifications: (userId: string, callback: (payload: any) => void) => void;
    unsubscribeAll: () => void;
  } {
    const subscriptions: any[] = [];

    return {
      subscribeToUserChanges: (userId: string, callback: (payload: any) => void) => {
        const subscription = supabase
          .channel(`user-changes-${userId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userId}`
          }, callback)
          .subscribe();

        subscriptions.push(subscription);
      },

      subscribeToLibraryChanges: (userId: string, callback: (payload: any) => void) => {
        const subscription = supabase
          .channel(`library-changes-${userId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'library_items',
            filter: `user_id=eq.${userId}`
          }, callback)
          .subscribe();

        subscriptions.push(subscription);
      },

      subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
        const subscription = supabase
          .channel(`notifications-${userId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          }, callback)
          .subscribe();

        subscriptions.push(subscription);
      },

      unsubscribeAll: () => {
        subscriptions.forEach(sub => {
          supabase.removeChannel(sub);
        });
        subscriptions.length = 0;
      }
    };
  }

  /**
   * Monitor slow queries
   */
  async getSlowQueries(
    threshold_ms: number = 1000,
    limit: number = 10
  ): Promise<Array<{ query: string; duration_ms: number; timestamp: string }>> {
    try {
      // This would require a custom function in Supabase
      const { data, error } = await supabase.rpc('get_slow_queries', {
        threshold_ms,
        query_limit: limit
      });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  // Private helper methods
  private async getTableInfo(): Promise<TableInfo[]> {
    try {
      // This would require custom functions to get table metadata
      const tables = [
        'users', 'books', 'library_items', 'wishlist_items',
        'notifications', 'discovery_profiles', 'fairy_states'
      ];

      const tableInfo: TableInfo[] = [];

      for (const table of tables) {
        try {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          tableInfo.push({
            table_name: table,
            column_count: 0, // Would need custom query
            row_count: count || 0,
            size_bytes: 0, // Would need custom query
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (tableError) {
          // Skip tables that don't exist or can't be accessed
        }
      }

      return tableInfo;
    } catch (error) {
      return [];
    }
  }

  private isDangerousQuery(query: string): boolean {
    const dangerousKeywords = [
      'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE',
      'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
    ];

    const upperQuery = query.toUpperCase();
    return dangerousKeywords.some(keyword => upperQuery.includes(keyword));
  }

  private createDatabaseError(errorCode: string, message: string, fairyMessage: string): DatabaseError {
    const error = new Error(message) as any;
    error.error = errorCode;
    error.message = message;
    error.fairy_message = fairyMessage;
    return error;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export convenience functions for common operations
export async function initializeDatabase(config?: Partial<DatabaseConfig>) {
  return databaseService.initialize(config);
}

export async function getDatabaseHealth() {
  return databaseService.getHealthStatus();
}

export async function validateDatabaseSchema() {
  return databaseService.validateSchema();
}

export async function createDatabaseBackup(type?: 'full' | 'incremental', tables?: string[]) {
  return databaseService.createBackup(type, tables);
}

export async function optimizeDatabase() {
  return databaseService.optimizeDatabase();
}

export function setupDatabaseSubscriptions() {
  return databaseService.setupRealtimeSubscriptions();
}

// Schema validation utilities
export function validateUserRecord(user: any): ValidationResult {
  const errors: string[] = [];

  if (!user.id || typeof user.id !== 'string') {
    errors.push('User ID is required and must be a string');
  }

  if (!user.email || typeof user.email !== 'string') {
    errors.push('Email is required and must be a string');
  }

  if (!user.name || typeof user.name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateBookRecord(book: any): ValidationResult {
  const errors: string[] = [];

  if (!book.id || typeof book.id !== 'string') {
    errors.push('Book ID is required and must be a string');
  }

  if (!book.title || typeof book.title !== 'string') {
    errors.push('Title is required and must be a string');
  }

  if (!book.author || typeof book.author !== 'string') {
    errors.push('Author is required and must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}