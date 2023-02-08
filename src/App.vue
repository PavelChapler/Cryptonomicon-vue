<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { subscribeToUpdateTicker, unsubscribeToUpdate } from "./api";
import AddTicker from "./components/AddTicker.vue";
import AddGraph from "./components/AddGraph.vue";

const tickers = ref([]);
const selectedTicker = ref(undefined);

const graph = ref([]);
const loading = ref(true);

const page = ref(1);
const filter = ref("");

onMounted(async () => {
  loading.value = false;

  const dataTickers = localStorage.getItem("cryptonomicon-list");

  if (dataTickers) {
    tickers.value = JSON.parse(dataTickers);
    tickers.value.forEach((ticker) => {
      subscribeToUpdateTicker(ticker.name, (price) => {
        updateTicker(ticker.name, price);
      });
    });
  }

  const dataURL = Object.fromEntries(
    new URL(window.location.href).searchParams.entries()
  );

  if (dataURL.filter) filter.value = dataURL.filter;

  if (dataURL.page) page.value = +dataURL.page;
});

const statePageAndFilter = computed(() => {
  return {
    page: page.value,
    filter: filter.value,
  };
});

function updateTicker(tickerName, price) {
  tickers.value
    .filter((ticker) => ticker.name === tickerName)
    .forEach((ticker) => {
      if (selectedTicker.value === ticker) {
        graph.value.push(price);
      }
      ticker.price = price;
    });
}

const maxGraphElements = ref(0);

watch(
  () => graph.value.length,
  () => {
    console.log(maxGraphElements.value);
    if (graph.value.length > maxGraphElements.value) {
      graph.value.shift();
    }
  }
);

function addTicker(ticker) {
  filter.value = "";

  let newTicket = {
    name: ticker.toUpperCase(),
    price: "-",
  };

  tickers.value.push(newTicket);

  subscribeToUpdateTicker(newTicket.name, (price) => {
    updateTicker(newTicket.name, price);
  });
}

function refactorPrice(price) {
  if (price === "-" || price === "–") return price;
  console.log();
  return price > 1 ? +price.toFixed(2) : +price.toPrecision(2);
}

function deleteTicker(i, item) {
  tickers.value.splice(i, 1);

  if (selectedTicker.value === item) {
    selectedTicker.value = null;
  }
  unsubscribeToUpdate(item.name);
}

const startPage = computed(() => {
  return (page.value - 1) * 6;
});

const endPage = computed(() => {
  return page.value * 6;
});

const filteredTickers = computed(() => {
  return tickers.value.filter((ticker) => ticker.name.includes(filter.value));
});

const pagesFilteredTickers = computed(() => {
  return filteredTickers.value.slice(+startPage.value, +endPage.value);
});

const noHasLastPage = computed(() => {
  return page.value < Math.ceil(filteredTickers.value.length / 6);
});

watch(filter, () => {
  page.value = 1;
});

watch(statePageAndFilter, (newValue) => {
  window.history.pushState(
    null,
    document.title,
    `${window.location.pathname}?filter=${newValue.filter}&page=${newValue.page}`
  );
});

watch(pagesFilteredTickers, () => {
  if (pagesFilteredTickers.value.length === 0 && page.value > 1) {
    page.value--;
  }
  localStorage.setItem("cryptonomicon-list", JSON.stringify(tickers.value));
});

watch(selectedTicker, () => {
  graph.value = [];
});

// export default {
//   name: "App",
//
//   data() {
//     return {
//       ticker: '',
//       tickers: [],
//     }
//   },
//
//   methods: {
//     addTicker() {
//       let newTicker = {
//         name: this.ticker,
//         price: ''
//       }
//
//       this.tickers.push(newTicker)
//     }
//   }
// }
</script>

<template>
  <div class="container">
    <div
      v-if="loading"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <AddTicker @add-ticker="addTicker" :tickers="tickers" />

    <template v-if="tickers.length !== 0">
      <hr class="w-full border-t border-gray-600 my-4" />
      <div class="">
        <button
          v-if="page > 1"
          @click="page--"
          class="mr-4 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Назад
        </button>
        <button
          v-if="noHasLastPage"
          @click="page++"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Вперед
        </button>
      </div>
      <div class="">
        Фильтр:
        <input v-model="filter" type="text" />
      </div>
      <hr class="w-full border-t border-gray-600 my-4" />
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="(item, i) of pagesFilteredTickers"
          :key="item.name"
          @click="selectedTicker = item"
          :class="{
            'border-4': selectedTicker === item,
            'bg-red-100': item.price === '–',
            'bg-white': item.price !== '–',
          }"
          class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ item.name }} - USD
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ refactorPrice(item.price) }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            @click.stop="deleteTicker(i, item)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path></svg
            >Удалить
          </button>
        </div>
      </dl>
      <hr class="w-full border-t border-gray-600 my-4" />
    </template>

    <add-graph
      v-show="selectedTicker"
      @update-graph="(arg) => (maxGraphElements = arg)"
      :selected-ticker="selectedTicker"
      :graph="graph"
      @close-graph="() => (selectedTicker = null)"
    />
  </div>
</template>

<style src="/src/app.css" scoped></style>
