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

loadData();
