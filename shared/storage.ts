import { supabase, supabaseAdmin } from './supabase';

// Configuração do storage do Supabase
export const storage = {
  // Upload de arquivo
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    return { data, error };
  },

  // Download de arquivo
  download: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  // Obter URL pública
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Listar arquivos
  list: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    return { data, error };
  },

  // Deletar arquivo
  remove: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    return { data, error };
  }
};

// Utilitários administrativos para storage
export const adminStorage = {
  // Criar bucket
  createBucket: async (bucketId: string, options?: any) => {
    const { data, error } = await supabaseAdmin.storage
      .createBucket(bucketId, options);
    return { data, error };
  },

  // Listar buckets
  listBuckets: async () => {
    const { data, error } = await supabaseAdmin.storage
      .listBuckets();
    return { data, error };
  },

  // Deletar bucket
  deleteBucket: async (bucketId: string) => {
    const { data, error } = await supabaseAdmin.storage
      .deleteBucket(bucketId);
    return { data, error };
  }
};

// Constantes para buckets
export const STORAGE_BUCKETS = {
  MENU_IMAGES: 'menu-images',
  PROFILE_IMAGES: 'profile-images',
  UPLOADS: 'uploads'
};