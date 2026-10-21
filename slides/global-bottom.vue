<!-- 每頁右下角的頁碼；封面和章節封面不顯示 -->
<template>
  <div
    v-if="$nav.currentPage > 1 && $nav.currentLayout !== 'section'"
    class="absolute bottom-1 right-3 text-[10px] opacity-40"
  >
    {{ $nav.currentPage }} / {{ $nav.total }}
  </div>
</template>
