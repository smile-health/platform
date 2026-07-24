import { parseDateTime } from '#utils/date';
import { numberFormatter } from '#utils/formatter';
import { Plugin } from 'chart.js';
import { TFunction } from 'i18next';

type Props = {
  t: TFunction<'dashboardAnnualCommitmentVsRealization'>
  language: string
  milestones?: {
    step: number
    date: string
    percent: number
    quantity: number
  }[]
}

export const createMilestonePlugin = ({
  t,
  language,
  milestones
}: Props): Plugin => ({
  id: 'milestones',
  beforeUpdate(chart) {
    if (!milestones?.length) return;
    const lastMilestone = milestones[milestones.length - 1];
    const xScale = chart.options.scales?.x;
    if (xScale) {
      xScale.max = lastMilestone.quantity;
    }
  },
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const { x } = scales;

    if (!x || !milestones) return;

    const milestonesParsed = milestones?.map((milestone) => ({
      ...milestone,
      date: parseDateTime(milestone.date, 'DD MMMM', language)
    }));

    ctx.save();

    const chartWidth = chartArea.right - chartArea.left;

    milestonesParsed?.forEach((milestone, index) => {
      const xPos = chartArea.left + (chartWidth * (index + 1)) / milestonesParsed.length;

      // Draw red marker line
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xPos, chartArea.top + 10);
      ctx.lineTo(xPos, chartArea.bottom - 10);
      ctx.stroke();

      // Draw title
      ctx.fillStyle = '#787878';
      ctx.font = '12px sans-serif';
      ctx.textAlign = index != milestonesParsed.length - 1 ? 'center' : 'right';
      ctx.textBaseline = 'bottom';
      const title = `${t('label.stage')} ${milestone.step} (${milestone.percent}%)`
      ctx.fillText(title, xPos, chartArea.top - 5);

      // Draw date
      ctx.fillStyle = '#787878';
      ctx.font = '12px sans-serif';
      const date = parseDateTime(milestone.date, 'DD MMMM')
      ctx.fillText(date, xPos, chartArea.top + 10);

      // Draw value at bottom
      ctx.fillStyle = '#787878';
      ctx.font = '12px sans-serif';
      ctx.textBaseline = 'top';
      const formattedValue = numberFormatter(milestone.quantity, language);
      ctx.fillText(formattedValue, xPos, chartArea.bottom);
    });

    ctx.restore();
  }
})

/**
 * Forces the x-axis max to match the largest row sum of the stacked datasets,
 * so the bars always fill the full container width.
 */
export const fitBarToContainerPlugin: Plugin = {
  id: 'fitBarToContainer',
  beforeUpdate(chart) {
    const { datasets } = chart.data;
    if (!datasets?.length) return;

    // Find the number of data points (rows)
    const rowCount = (datasets[0].data as number[]).length;

    let maxSum = 0;
    for (let i = 0; i < rowCount; i++) {
      const rowSum = datasets.reduce((sum, ds) => {
        const val = (ds.data as number[])[i] ?? 0;
        return sum + (val > 0 ? val : 0); // only positive values stack forward
      }, 0);
      if (rowSum > maxSum) maxSum = rowSum;
    }

    if (maxSum > 0) {
      const xScale = chart.options.scales?.x;
      if (xScale) xScale.max = maxSum;
    }
  }
}
