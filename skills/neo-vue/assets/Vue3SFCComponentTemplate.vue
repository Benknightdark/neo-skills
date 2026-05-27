<template>
  <div class="neo-card-container">
    <header class="neo-card-header">
      <h3 class="neo-card-title">{{ title }}</h3>
      <span v-if="badge" class="neo-badge">{{ badge }}</span>
    </header>

    <main class="neo-card-body">
      <p class="neo-card-description">
        <slot name="description">這是預設的卡片描述內容。</slot>
      </p>

      <div class="neo-interactive-section">
        <button 
          class="neo-btn neo-btn-primary" 
          :disabled="isLoading" 
          @click="handleAction"
        >
          <span v-if="isLoading" class="neo-spinner"></span>
          {{ buttonText }}
        </button>

        <!-- 雙向綁定輸入框範例 -->
        <input 
          v-model="inputValue" 
          type="text" 
          class="neo-input" 
          placeholder="請輸入內容..."
        />
      </div>
    </main>

    <footer class="neo-card-footer">
      <span class="neo-footer-text">點擊次數：{{ clickCount }} (雙倍: {{ doubleClickCount }})</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// ==========================================
// 1. 屬性 (Props) 定義 — 嚴格使用強型別聲明
// ==========================================
const props = withDefaults(
  defineProps<{
    title: string;
    badge?: string;
    buttonText?: string;
    isLoading?: boolean;
  }>(),
  {
    badge: '',
    buttonText: '確定',
    isLoading: false
  }
);

// ==========================================
// 2. 事件 (Emits) 定義 — 嚴格使用強型別聲明
// ==========================================
const emit = defineEmits<{
  (e: 'action', clickCount: number): void;
  (e: 'update:input', value: string): void;
}>();

// ==========================================
// 3. 雙向綁定 (Model) 定義 — Vue 3.4+ 推薦做法
// ==========================================
const inputValue = defineModel<string>({ default: '' });

// ==========================================
// 4. 響應式狀態 (State) 定義 — 優先選用 ref 以維持一致性
// ==========================================
const clickCount = ref(0);

// ==========================================
// 5. 計算屬性 (Computed) 定義 — 必須為純函式，無 Side Effects
// ==========================================
const doubleClickCount = computed(() => clickCount.value * 2);

// ==========================================
// 6. 方法 (Methods) 定義
// ==========================================
function handleAction() {
  clickCount.value++;
  emit('action', clickCount.value);
}
</script>

<style scoped>
/* ==========================================
   CSS 樣式設計 — 優先使用 class 選擇器以保證效能，並採用質感配色
   ========================================== */
:root {
  --primary-color: #3eaf7c;
  --primary-hover: #4abf8a;
  --bg-color: #ffffff;
  --border-color: #e2e8f0;
  --text-primary: #2d3748;
  --text-secondary: #718096;
}

.neo-card-container {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease-in-out;
  max-width: 400px;
}

.neo-card-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.neo-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.neo-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #2d3748);
  margin: 0;
}

.neo-badge {
  background-color: #e6fffa;
  color: #319795;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 9999px;
}

.neo-card-body {
  margin-bottom: 20px;
}

.neo-card-description {
  font-size: 0.95rem;
  color: var(--text-secondary, #718096);
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.neo-interactive-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.neo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.neo-btn-primary {
  background-color: var(--primary-color, #3eaf7c);
  color: white;
}

.neo-btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover, #4abf8a);
}

.neo-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.neo-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease;
}

.neo-input:focus {
  border-color: var(--primary-color, #3eaf7c);
}

.neo-card-footer {
  border-top: 1px solid var(--border-color, #e2e8f0);
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.neo-footer-text {
  font-size: 0.8rem;
  color: var(--text-secondary, #718096);
}

/* Spinner CSS */
.neo-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
