import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryExpenseChartProps {
    labels: string[];
    amounts: number[];
}

const CategoryExpenseChart = ({
    labels,
    amounts,
}: CategoryExpenseChartProps) => {

    const data = {
        labels,
        datasets: [
            {
                data: amounts,
                backgroundColor: [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#0ea5e9",
                    "#8b5cf6",
                    "#ec4899",
                ],
                borderColor: "#141f33",
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    color: "#cbd5e1",
                    font: {
                        family: "Inter",
                        size: 12,
                        weight: 500,
                    },
                    padding: 14,
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
    };

    return (
        <div style={{ height: "320px" }}>
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default CategoryExpenseChart;
