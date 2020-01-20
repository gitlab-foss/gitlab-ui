<script>
import BInputGroup from 'bootstrap-vue/src/components/input-group/input-group';
import BInputGroupPrepend from 'bootstrap-vue/src/components/input-group/input-group-prepend';
import BInputGroupAppend from 'bootstrap-vue/src/components/input-group/input-group-append';
import BFormInput from 'bootstrap-vue/src/components/form-input/form-input';
import GlDropdown from '../../dropdown/dropdown.vue';
import GlDropdownItem from '../../dropdown/dropdown_item.vue';
import InputGroupMixin from './form_input_group_mixin';

export default {
  name: 'GlFormInputGroup',
  components: {
    BInputGroup,
    BInputGroupPrepend,
    BInputGroupAppend,
    BFormInput,
    GlDropdown,
    GlDropdownItem,
  },
  mixins: [InputGroupMixin],
  props: {
    selectOnClick: {
      type: Boolean,
      required: false,
      default: false,
    },
    predefinedOptions: {
      type: Array,
      required: false,
      default: () => [{ value: '', name: '' }],
      validator: options => options.every(opt => Object.keys(opt).includes('name', 'value')),
    },
  },
  data() {
    return {
      activeOption: this.predefinedOptions && this.predefinedOptions[0].name,
    };
  },
  methods: {
    handleClick() {
      if (this.selectOnClick) {
        this.$refs.input.$el.select();
      }
    },
    updateValue(option) {
      const { name, value } = option;
      this.activeOption = name;
      this.localValue = value;
    },
  },
};
</script>
<template>
  <div>
    <b-input-group>
      <b-input-group-prepend>
        <slot name="prepend"></slot>
        <gl-dropdown v-if="activeOption" :text="activeOption">
          <gl-dropdown-item
            v-for="option in predefinedOptions"
            :key="option.value"
            :active="activeOption === option.name"
            @click="updateValue(option)"
          >
            {{ option.name }}
          </gl-dropdown-item>
        </gl-dropdown>
      </b-input-group-prepend>

      <b-form-input
        ref="input"
        v-model="localValue"
        class="gl-form-input"
        v-bind="$attrs"
        v-on="$listeners"
        @click="handleClick"
      />

      <b-input-group-append>
        <slot name="append"></slot>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>