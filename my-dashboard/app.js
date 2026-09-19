const state = { data: null };

const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const source = $('#data-source').val() || 'data/expenses.json';
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：自建教学数据（虚构）');
    $('#status').hide();
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

const renderCards = (data) => {
  $('#cards').empty();
  const months = data.months;
  data.series.forEach(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4">${total}</p>
            <p class="card-text small text-muted">共${months.length}个月累计支出（元）</p>
          </div>
        </div>
      </div>
    `);
  });
};

// 各月各类消费：ECharts 柱状图
let barChart = null;
const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: '各月各类消费支出', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { data: data.months },
    yAxis: { name: '元' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
};

// 消费趋势：Chart.js 折线图
let lineChart = null;
const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy(); // 防重复初始化
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.months,
      datasets: data.series.map(s => ({
        label: s.category,
        data: s.counts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '消费趋势 (单位: 元)' }
      }
    }
  });
};

window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
  // Chart.js 响应式默认自动处理，无需手动
});

// 交互：切换数据源（正常数据 / 空数据），用于演示空数据状态
$('#data-source').on('change', () => {
  $('#cards').empty();
  if (barChart) barChart.clear();
  if (lineChart) {
    lineChart.destroy();
    lineChart = null;
  }
  loadData();
});

loadData();
