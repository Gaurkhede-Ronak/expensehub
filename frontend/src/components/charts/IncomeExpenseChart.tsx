import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    Title
);

interface IncomeExpenseChartProps {
    labels: string[];
    income: number[];
    expense: number[];
}

const IncomeExpenseChart = ({
    labels,
    income,
    expense,
}: IncomeExpenseChartProps) => {

    const data = {
        labels,
        datasets: [
            {
                label: "Income",
                data: income,
                backgroundColor: "#10b981",
                borderRadius: 6,
            },
            {
                label: "Expense",
                data: expense,
                backgroundColor: "#ef4444",
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    color: "#cbd5e1",
                    font: {
                        family: "Inter",
                        size: 12,
                        weight: 500,
                    },
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: "#0d1525",
                titleColor: "#f8fafc",
                bodyColor: "#cbd5e1",
                borderColor: "#22324b",
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: {
                    color: "#1e2c44",
                    drawBorder: false,
                },
                ticks: {
                    color: "#94a3b8",
                    font: {
                        family: "Inter",
                        size: 11,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: "#1e2c44",
                    drawBorder: false,
                },
                ticks: {
                    color: "#94a3b8",
                    font: {
                        family: "Inter",
                        size: 11,
                    },
                    callback: (value: string | number) =>
                        `₹${Number(value).toLocaleString("en-IN")}`,
                },
            },
        },
    };

    return (
        <div style={{ height: "320px" }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default IncomeExpenseChart;
