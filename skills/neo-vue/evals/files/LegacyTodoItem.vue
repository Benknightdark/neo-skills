<!-- 遺留的 Vue 2 / Options API 元件，具有多項典型反模式 -->
<template>
  <div class="todo-item">
    <input type="checkbox" v-model="todo.completed" @change="statusChanged" />
    <span :class="{ completed: todo.completed }">{{ todo.text }}</span>
    <button @click="deleteItem">刪除</button>
  </div>
</template>

<script>
export default {
  name: 'LegacyTodoItem',
  props: {
    // 雖然宣告了 props，但是在 template 中使用 v-model="todo.completed"
    // 這直接修改了 props 傳入的物件屬性，違反了 props 單向資料流
    todo: {
      type: Object,
      required: true
    }
  },
  methods: {
    statusChanged() {
      // 潛在隱患：直接修改 props 物件內部屬性
      this.todo.completed = !this.todo.completed;
      this.$emit('status-change', this.todo);
    },
    deleteItem() {
      // 潛在隱患：隱式地通過父元件屬性方法直接刪除，或是直接操作
      if (this.$parent) {
        this.$parent.todos = this.$parent.todos.filter(t => t.id !== this.todo.id);
      }
    }
  }
}
</script>

<style>
/* 潛在隱患：未使用 scoped，且直接使用 button 全域選擇器，引發嚴重的全域樣式污染 */
.todo-item {
  display: flex;
  align-items: center;
}
.completed {
  text-decoration: line-through;
}
button {
  margin-left: auto;
  color: red;
}
</style>
