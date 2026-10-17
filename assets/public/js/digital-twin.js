/* Nigraan - Digital Student Progress Twin & Historical Trend Visualizer */

class DigitalTwinModule {
  // Render Historical Dual Trend Line Chart (Attendance % & Marks %)
  renderTrendLineChart(student) {
    const attTrend = (student.attendanceTrend && student.attendanceTrend.length >= 3)
      ? student.attendanceTrend
      : [Math.min(100, student.attendanceCurrent + 25), Math.min(100, student.attendanceCurrent + 12), student.attendanceCurrent];
    
    const acadTrend = (student.academicTrend && student.academicTrend.length >= 3)
      ? student.academicTrend
      : [Math.min(100, student.academicCurrent + 20), Math.min(100, student.academicCurrent + 10), student.academicCurrent];

    const pointsAtt = attTrend.map((v, i) => `${20 + i * 140},${120 - (v / 100) * 90}`).join(' ');
    const pointsAcad = acadTrend.map((v, i) => `${20 + i * 140},${120 - (v / 100) * 90}`).join(' ');

    return `
      <div class="stitch-card bg-white">
        <div class="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700">show_chart</span>
            <h3 class="font-extrabold text-slate-900 text-xs">Historical Performance Trends</h3>
          </div>
          <div class="flex items-center gap-3 text-[10px] font-bold">
            <span class="flex items-center gap-1 text-emerald-800"><span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Attendance %</span>
            <span class="flex items-center gap-1 text-indigo-800"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Marks %</span>
          </div>
        </div>

        <div class="relative bg-slate-50 p-3 rounded-xl border border-slate-200 my-2">
          <svg class="w-full h-36 overflow-visible" viewBox="0 0 320 130">
            <!-- Grid Lines -->
            <line x1="0" y1="30" x2="320" y2="30" stroke="#e2e8f0" stroke-dasharray="2 2"/>
            <line x1="0" y1="75" x2="320" y2="75" stroke="#e2e8f0" stroke-dasharray="2 2"/>
            <line x1="0" y1="120" x2="320" y2="120" stroke="#cbd5e1" stroke-width="1.5"/>

            <!-- Y Axis Labels -->
            <text x="5" y="25" fill="#94a3b8" font-size="9" font-weight="bold">100%</text>
            <text x="5" y="70" fill="#94a3b8" font-size="9" font-weight="bold">50%</text>
            <text x="5" y="115" fill="#94a3b8" font-size="9" font-weight="bold">0%</text>

            <!-- Attendance Line (Emerald) -->
            <polyline fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" points="${pointsAtt}"/>
            ${attTrend.map((v, i) => `
              <circle cx="${20 + i * 140}" cy="${120 - (v / 100) * 90}" r="4" fill="#059669" stroke="#ffffff" stroke-width="2"/>
              <text x="${20 + i * 140}" y="${105 - (v / 100) * 90}" fill="#065f46" font-size="9" font-weight="extrabold" text-anchor="middle">${v}%</text>
            `).join('')}

            <!-- Marks Line (Indigo) -->
            <polyline fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" points="${pointsAcad}"/>
            ${acadTrend.map((v, i) => `
              <circle cx="${20 + i * 140}" cy="${120 - (v / 100) * 90}" r="4" fill="#4f46e5" stroke="#ffffff" stroke-width="2"/>
              <text x="${20 + i * 140}" y="${135 - (v / 100) * 90}" fill="#3730a3" font-size="9" font-weight="extrabold" text-anchor="middle">${v}%</text>
            `).join('')}
          </svg>

          <div class="flex justify-between text-[10px] font-bold text-slate-500 mt-1 px-3">
            <span>3 Weeks Ago</span>
            <span>2 Weeks Ago</span>
            <span>Current Week</span>
          </div>
        </div>
      </div>
    `;
  }

  renderDigitalTwinTimeline(student) {
    if (!student.digitalTwinTimeline || student.digitalTwinTimeline.length === 0) {
      return `<p class="text-xs text-slate-500 italic">No timeline events recorded yet.</p>`;
    }

    const nodeIcons = [
      { icon: "close", color: "bg-red-100 text-red-600 border-red-300" },
      { icon: "trending_down", color: "bg-amber-100 text-amber-600 border-amber-300" },
      { icon: "attach_money", color: "bg-pink-100 text-pink-600 border-pink-300" },
      { icon: "handshake", color: "bg-emerald-100 text-emerald-600 border-emerald-300" }
    ];

    const nodesHtml = student.digitalTwinTimeline.map((item, idx) => {
      const iconStyle = nodeIcons[idx % nodeIcons.length];

      return `
        <div class="stitch-timeline-node">
          <div class="stitch-timeline-icon ${iconStyle.color} border">
            <span class="material-symbols-outlined text-sm font-bold">${iconStyle.icon}</span>
          </div>
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between mb-1">
              <h5 class="font-extrabold text-slate-900 text-xs">${item.title}</h5>
              <span class="text-[10px] font-bold text-slate-400">${item.week}</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-snug">${item.detail}</p>
          </div>
        </div>
      `;
    }).join('');

    return `
      ${this.renderTrendLineChart(student)}

      <div class="stitch-card bg-white">
        <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-700">timeline</span>
            <h3 class="font-extrabold text-slate-900 text-sm">Digital Progress Twin</h3>
          </div>
          <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 30 Days</span>
        </div>

        <div class="stitch-timeline">
          ${nodesHtml}
        </div>
      </div>
    `;
  }
}

const digitalTwinModule = new DigitalTwinModule();
