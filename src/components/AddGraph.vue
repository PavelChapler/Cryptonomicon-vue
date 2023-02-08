<template>
  <section class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ selectedTicker?.name }} - USD
    </h3>
    <div
      ref="graphDom"
      class="flex items-end border-gray-600 border-b border-l h-64"
    >
      <div
        v-for="(bar, i) of normalizeGraph"
        :key="i"
        :style="{ height: `${bar}%`, width: `${graphBarWidth}px` }"
        class="bg-purple-800 border"
      ></div>
    </div>

    <add-button-close @close-graph="emit('closeGraph')" />
  </section>
</template>

<script setup>
import AddButtonClose from "./AddCloseGraphButton.vue";
import {
  computed,
  defineProps,
  defineEmits,
  nextTick,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  watch,
  onBeforeUnmount,
} from "vue";

const graph = ref([]);
const graphBarWidth = 38;
const maxGraphElements = ref(100);
const graphDom = ref(null);
const props = defineProps(["selectedTicker", "graph"]);
const emit = defineEmits(["updateGraph", "closeGraph"]);

const emitFunction = () => {
  emit("updateGraph", maxGraphElements.value);
};

const normalizeGraph = computed(() => {
  emitFunction();
  const minValue = Math.min(...props.graph);
  const maxValue = Math.max(...props.graph);

  return props.graph.map(
    (price) => 5 + ((price - minValue) * 100) / (maxValue - minValue)
  );
});

function calculateMaxGraphElements() {
  maxGraphElements.value = graphDom.value.clientWidth / graphBarWidth;
}

onUpdated(() => {});

onMounted(() => {
  console.log("sdf");
  nextTick(() => calculateMaxGraphElements());

  window.addEventListener("resize", () => {
    calculateMaxGraphElements();
    graph.value = graph.value.slice(0, maxGraphElements.value);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", () => {
    calculateMaxGraphElements();
    graph.value = graph.value.slice(0, maxGraphElements.value);
  });
});
</script>
