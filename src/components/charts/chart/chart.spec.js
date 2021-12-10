import { shallowMount } from '@vue/test-utils';
import * as echarts from 'echarts';
import Chart from './chart.vue';
import createTheme from '~/utils/charts/theme';
import { useMockResizeObserver } from '~helpers/mock_dom_observer';

const defaultHeight = 400;

jest.mock('echarts', () => ({
  init: jest.fn(() => ({
    setOption: jest.fn(),
    resize: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
  registerTheme: jest.fn(),
}));

describe('chart component', () => {
  const options = {};
  const mountArgs = [Chart, { propsData: { options: {} } }];
  const themeName = 'gitlab';
  let wrapper;

  const { trigger: triggerResize } = useMockResizeObserver();

  it('initializes chart using $refs.chart', async () => {
    wrapper = shallowMount(...mountArgs);
    await wrapper.vm.$nextTick();

    expect(echarts.init).toHaveBeenCalledWith(
      wrapper.findComponent({ ref: 'chart' }).element,
      themeName,
      {
        renderer: wrapper.props().renderer,
        width: 300,
        height: 400,
      }
    );
  });

  it('does not resize the chart when responsive = false', async () => {
    wrapper = shallowMount(...mountArgs);
    await wrapper.vm.$nextTick();
    // initial call when chart gets created
    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);

    triggerResize(wrapper.element);
    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);
  });

  it('resizes the chart when responsive = true', async () => {
    wrapper = shallowMount(Chart, { propsData: { options: {}, responsive: true } });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(1);

    triggerResize(wrapper.element);

    expect(wrapper.vm.chart.resize).toHaveBeenCalledTimes(2);
  });

  it('emits "created" after initializing chart', async () => {
    wrapper = shallowMount(...mountArgs);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('created')).toEqual([[wrapper.vm.chart]]);
  });

  it('uses GitLab theme', () => {
    wrapper = shallowMount(...mountArgs);
    const [firstRegisterThemeCall] = echarts.registerTheme.mock.calls;
    expect(firstRegisterThemeCall[0]).toBe(themeName);
    expect(JSON.stringify(firstRegisterThemeCall[1])).toEqual(JSON.stringify(createTheme()));
  });

  it('waits a tick before creating the chart', async () => {
    wrapper = shallowMount(...mountArgs);

    expect(wrapper.vm.chart).toBe(null);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.chart).toBeDefined();
  });

  describe('custom sizing', () => {
    const width = 1234;
    const height = 123;

    it('sets chart to custom width and height if specified', async () => {
      wrapper = shallowMount(Chart, { propsData: { options: {}, width, height } });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.chart.resize).toHaveBeenCalledWith({ width, height });
    });

    it('sets chart to custom width if specified', async () => {
      wrapper = shallowMount(Chart, { propsData: { options: {}, width } });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.chart.resize).toHaveBeenCalledWith({ width, height: defaultHeight });
    });

    it('sets chart to custom height if specified', async () => {
      wrapper = shallowMount(Chart, { propsData: { options: {}, height } });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.chart.resize).toHaveBeenCalledWith({ width: 'auto', height });
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(...mountArgs);
    });

    describe('draw method', () => {
      it('sets chart options', () => {
        wrapper.vm.draw();

        expect(wrapper.vm.chart.setOption).toHaveBeenCalledWith(options);
      });

      it('emits chart updated after drawing', () => {
        wrapper.vm.draw();
        const { chart } = wrapper.vm;

        expect(wrapper.emitted('updated')).toEqual([[chart], [chart]]);
      });
    });

    describe('setChartSize method', () => {
      it('sets chart size', () => {
        wrapper.vm.setChartSize();

        expect(wrapper.vm.chart.resize).toHaveBeenCalledWith({
          height: defaultHeight,
          width: 'auto',
        });
      });
    });
  });
});
