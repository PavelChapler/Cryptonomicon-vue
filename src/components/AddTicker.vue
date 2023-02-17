<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label class="block text-sm font-medium text-gray-700" for="wallet"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="addTicker"
            @input="(alreadyAdded = false), search()"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="sortedSearchData.length > 0"
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
        >
          <span
            v-for="(token, i) of sortedSearchData"
            :key="i"
            @click="(ticker = token), addTicker()"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ token }}
          </span>
        </div>
        <div v-if="alreadyAdded" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>

    <add-button @click="addTicker" class="my-4" />
    <!-- Heroicon name: solid/mail -->
  </section>
</template>

<script setup>
import AddButton from "./AddButton.vue";
import { onMounted, ref, defineEmits, defineProps, computed } from "vue";

const ticker = ref("");
const searchData = [];
const sortedSearchData = ref([]);
const alreadyAdded = ref(false);

const props = defineProps(["tickers"]);
const emit = defineEmits(["addTicker"]);

const emitFunction = (value) => {
  emit("addTicker", value);
};

function addTicker() {
  validate(ticker.value);
  if (alreadyAdded.value) return;

  emitFunction(ticker.value);

  ticker.value = "";
  sortedSearchData.value = [];
}

onMounted(async () => {
  const response = await fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  );
  const result = await response.json();
  searchData.value = Object.keys(result.Data);
});

function search() {
  if (ticker.value.length !== 0) {
    sortedSearchData.value = searchData.value
      .filter((item) => item.includes(ticker.value.toUpperCase()))
      .slice(0, 4);
  } else sortedSearchData.value = [];
}

function validate(tickerName) {
  if (
    props.tickers.find((ticker) => ticker.name === tickerName.toUpperCase())
  ) {
    alreadyAdded.value = true;
  } else {
    alreadyAdded.value = false;
  }
}
</script>
