const app = document.getElementById('app');

app.innerHTML = `
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-appGreen text-white px-6 py-5 shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight">AMP Growth Units</h1>
          <p class="text-xs text-green-200 mt-0.5">Premium Dashboard</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-appGold flex items-center justify-center">
          <span class="text-appGreen font-bold text-sm">AG</span>
        </div>
      </div>
    </header>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-3 px-4 mt-4">
      <div class="bg-appCard rounded-2xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Units</p>
        <p class="text-2xl font-bold text-appGreen mt-1">1,248</p>
        <p class="text-xs text-appLightGreen mt-1 font-medium">+12.4% this month</p>
      </div>
      <div class="bg-appCard rounded-2xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Revenue</p>
        <p class="text-2xl font-bold text-appGreen mt-1">$84.2K</p>
        <p class="text-xs text-appLightGreen mt-1 font-medium">+8.1% this month</p>
      </div>
    </div>

    <!-- Chart Card -->
    <div class="bg-appCard mx-4 mt-4 rounded-2xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-appText">Growth Trend</h2>
        <span class="text-xs text-appGold font-semibold bg-yellow-50 px-2 py-0.5 rounded-full">6 months</span>
      </div>
      <div id="growth-chart"></div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-appCard mx-4 mt-4 rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
      <h2 class="text-sm font-semibold text-appText mb-3">Recent Activity</h2>
      <div class="space-y-3" id="activity-list"></div>
    </div>
  </div>
`;

const activities = [
  { label: 'Unit #A-104 activated', time: '2 min ago', color: 'bg-green-100 text-green-700' },
  { label: 'Unit #B-209 growth +5%', time: '1 hr ago', color: 'bg-blue-100 text-blue-700' },
  { label: 'Unit #C-312 milestone reached', time: '3 hr ago', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Unit #A-089 review due', time: '5 hr ago', color: 'bg-red-100 text-red-700' },
];

const activityList = document.getElementById('activity-list');
activities.forEach(a => {
  activityList.innerHTML += `
    <div class="flex items-center gap-3">
      <span class="text-xs font-semibold px-2 py-1 rounded-lg ${a.color} whitespace-nowrap">${a.time}</span>
      <span class="text-sm text-appText">${a.label}</span>
    </div>
  `;
});

if (typeof ApexCharts !== 'undefined') {
  const options = {
    series: [{ name: 'Units', data: [820, 932, 901, 1045, 1100, 1248] }],
    chart: { type: 'area', height: 160, toolbar: { show: false }, sparkline: { enabled: false } },
    colors: ['#14532D'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: { categories: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'], labels: { style: { fontSize: '10px', colors: '#94a3b8' } } },
    yaxis: { labels: { style: { fontSize: '10px', colors: '#94a3b8' } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' },
  };
  new ApexCharts(document.getElementById('growth-chart'), options).render();
}

if (typeof gsap !== 'undefined') {
  gsap.from('header', { y: -30, opacity: 0, duration: 0.5, ease: 'power2.out' });
  gsap.from('.grid > div', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power2.out' });
  gsap.from('#growth-chart', { y: 20, opacity: 0, duration: 0.5, delay: 0.4, ease: 'power2.out' });
  gsap.from('#activity-list > div', { x: -20, opacity: 0, duration: 0.4, stagger: 0.08, delay: 0.6, ease: 'power2.out' });
}
