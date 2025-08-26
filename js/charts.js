// Charts and Analytics Manager
class ChartManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        // Wait for Chart.js to be loaded
        if (typeof Chart !== 'undefined') {
            this.initializeCharts();
        } else {
            // Fallback if Chart.js is not loaded
            this.createFallbackCharts();
        }
    }

    initializeCharts() {
        // Initialize all charts on the page
        this.initGrowthChart();
        this.initUserChart();
        this.initRevenueChart();
        this.initOrderStatusChart();
        this.initProductCategoryChart();
        this.initSalesChart();
    }

    initGrowthChart() {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Users',
                    data: [120, 190, 300, 500, 700, 900, 1100, 1247, 1350, 1450, 1550, 1650],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Orders',
                    data: [1000, 1500, 2200, 3100, 4200, 5500, 7200, 8943, 9500, 10200, 11000, 12000],
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Products',
                    data: [50, 120, 200, 350, 520, 780, 1100, 1456, 1800, 2200, 2800, 3567],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Count'
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        this.charts.growth = new Chart(ctx, config);
    }

    initUserChart() {
        const ctx = document.getElementById('userChart');
        if (!ctx) return;

        const data = {
            labels: ['Admins', 'Wholesalers', 'Retailers'],
            datasets: [{
                data: [12, 145, 1090],
                backgroundColor: [
                    '#ffc107',
                    '#0d6efd',
                    '#198754'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        this.charts.user = new Chart(ctx, config);
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const data = {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Revenue ($M)',
                data: [0.5, 0.8, 1.2, 2.4],
                backgroundColor: 'rgba(13, 110, 253, 0.8)',
                borderColor: '#0d6efd',
                borderWidth: 2
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (Million $)'
                        }
                    }
                }
            }
        };

        this.charts.revenue = new Chart(ctx, config);
    }

    initOrderStatusChart() {
        const ctx = document.getElementById('orderStatusChart');
        if (!ctx) return;

        const data = {
            labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
            datasets: [{
                data: [234, 156, 189, 421],
                backgroundColor: [
                    '#ffc107',
                    '#fd7e14',
                    '#0dcaf0',
                    '#198754'
                ],
                borderWidth: 0
            }]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        };

        this.charts.orderStatus = new Chart(ctx, config);
    }

    initProductCategoryChart() {
        const ctx = document.getElementById('productCategoryChart');
        if (!ctx) return;

        const data = {
            labels: ['Electronics', 'Clothing', 'Furniture', 'Books', 'Sports', 'Beauty'],
            datasets: [{
                label: 'Products',
                data: [1245, 892, 567, 234, 445, 184],
                backgroundColor: [
                    '#0d6efd',
                    '#198754',
                    '#ffc107',
                    '#dc3545',
                    '#6f42c1',
                    '#fd7e14'
                ],
                borderWidth: 0
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        this.charts.productCategory = new Chart(ctx, config);
    }

    initSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'This Week',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    backgroundColor: 'rgba(13, 110, 253, 0.8)',
                    borderColor: '#0d6efd',
                    borderWidth: 2
                },
                {
                    label: 'Last Week',
                    data: [8000, 14000, 12000, 20000, 18000, 25000, 23000],
                    backgroundColor: 'rgba(25, 135, 84, 0.8)',
                    borderColor: '#198754',
                    borderWidth: 2
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sales ($)'
                        }
                    }
                }
            }
        };

        this.charts.sales = new Chart(ctx, config);
    }

    createFallbackCharts() {
        // Create simple visual representations when Chart.js is not available
        const chartContainers = ['growthChart', 'userChart', 'revenueChart', 'orderStatusChart', 'productCategoryChart', 'salesChart'];
        
        chartContainers.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const container = canvas.parentElement;
                container.innerHTML = `
                    <div class="chart-fallback d-flex align-items-center justify-content-center h-100">
                        <div class="text-center">
                            <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Chart visualization would appear here</p>
                            <small class="text-muted">Chart.js not loaded</small>
                        </div>
                    </div>
                `;
            }
        });
    }

    // Update chart data (for real-time updates)
    updateChartData(chartName, newData) {
        if (this.charts[chartName]) {
            this.charts[chartName].data = newData;
            this.charts[chartName].update('none');
        }
    }

    // Animate chart
    animateChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].update('active');
        }
    }

    // Destroy chart
    destroyChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
            delete this.charts[chartName];
        }
    }

    // Resize all charts
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }

    // Export chart as image
    exportChart(chartName, filename) {
        if (this.charts[chartName]) {
            const url = this.charts[chartName].toBase64Image();
            const link = document.createElement('a');
            link.download = filename || `${chartName}-chart.png`;
            link.href = url;
            link.click();
        }
    }

    // Get chart data for reporting
    getChartData(chartName) {
        if (this.charts[chartName]) {
            return this.charts[chartName].data;
        }
        return null;
    }

    // Simulate real-time data updates
    startRealTimeUpdates() {
        setInterval(() => {
            this.updateRandomData();
        }, 30000); // Update every 30 seconds
    }

    updateRandomData() {
        // Update growth chart with new data point
        if (this.charts.growth) {
            const chart = this.charts.growth;
            const datasets = chart.data.datasets;
            
            datasets.forEach(dataset => {
                const lastValue = dataset.data[dataset.data.length - 1];
                const change = Math.floor(Math.random() * 100) - 50; // Random change between -50 and +50
                const newValue = Math.max(0, lastValue + change);
                dataset.data.push(newValue);
                
                // Keep only last 12 data points
                if (dataset.data.length > 12) {
                    dataset.data.shift();
                }
            });
            
            chart.update('none');
        }

        // Update user distribution
        if (this.charts.user) {
            const chart = this.charts.user;
            const data = chart.data.datasets[0].data;
            
            // Simulate new user registrations
            const randomRole = Math.floor(Math.random() * 3);
            data[randomRole] += 1;
            
            chart.update('none');
        }
    }

    // Generate report data
    generateReportData() {
        const reportData = {};
        
        Object.keys(this.charts).forEach(chartName => {
            const chart = this.charts[chartName];
            if (chart) {
                reportData[chartName] = {
                    type: chart.config.type,
                    data: chart.data,
                    options: chart.options
                };
            }
        });
        
        return reportData;
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.chartManager) {
        window.chartManager.resizeCharts();
    }
});

// Initialize chart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Chart.js to load
    setTimeout(() => {
        window.chartManager = new ChartManager();
        
        // Start real-time updates if charts are initialized
        if (Object.keys(window.chartManager.charts).length > 0) {
            window.chartManager.startRealTimeUpdates();
        }
    }, 1000);
});

// Export for other modules
window.ChartManager = ChartManager;