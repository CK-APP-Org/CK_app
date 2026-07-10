<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">自訂工具列</div>
      </q-card-section>
      <q-card-section>
        <q-list separator>
          <q-item v-for="(item, index) in menuItems" :key="index">
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
            <q-item-section side>
              <q-toggle
                v-if="!item.fixed"
                v-model="item.visible"
                @update:model-value="(val) => toggleVisibility(index, val)"
                :disable="item.fixed"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn-group flat>
                <q-btn
                  flat
                  dense
                  round
                  icon="arrow_upward"
                  @click="moveItem(index, -1)"
                  :disable="index === 0"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="arrow_downward"
                  @click="moveItem(index, 1)"
                  :disable="index === menuItems.length - 1"
                />
              </q-btn-group>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const menuItems = computed({
  get: () => store.getters.getMenuItems,
  set: (newItems) => store.dispatch("updateMenuItems", newItems),
});

const toggleVisibility = (index, newValue) => {
  store.dispatch("toggleMenuItemVisibility", { index, newValue });
};

const moveItem = (index, direction) => {
  const newItems = [...menuItems.value];
  const item = newItems.splice(index, 1)[0];
  newItems.splice(index + direction, 0, item);
  store.dispatch("updateMenuItems", newItems);
};
</script>
