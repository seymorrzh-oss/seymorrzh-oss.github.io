/* =========================================================
   饼饼服药记录
========================================================= */

const STORAGE_KEY =
  "bingbing_medicine_tracker_v3";


/* =========================================================
   已确定的信息
========================================================= */

const WAITING_START =
  "2026-09-17";

const WAITING_DAYS =
  7;

const YASMIN_TOTAL =
  21;


/* =========================================================
   数据
========================================================= */

let state = loadState();


function defaultState() {

  return {

    periodStart: null,

    medicineTime:
      "22:00",

    yasminTaken:
      {}

  };

}


function loadState() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      );


    return {

      ...defaultState(),

      ...(saved || {})

    };

  } catch {

    return defaultState();

  }

}


function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


/* =========================================================
   北京时间
========================================================= */

function getBeijingNow() {

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Shanghai",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit",

        second:
          "2-digit",

        hour12:
          false
      }
    )
    .formatToParts(
      new Date()
    );


  const data = {};


  parts.forEach(
    part => {

      if (
        part.type !==
        "literal"
      ) {

        data[
          part.type
        ] =
          part.value;

      }

    }
  );


  return {

    date:
      `${data.year}-${data.month}-${data.day}`,

    time:
      `${data.hour}:${data.minute}`,

    seconds:
      data.second

  };

}


/* =========================================================
   日期工具
========================================================= */

function parseDate(value) {

  const [
    year,
    month,
    day
  ] =
    value
      .split("-")
      .map(Number);


  return new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0
  );

}


function formatDate(date) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );


  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        "0"
      );


  return (
    `${year}-${month}-${day}`
  );

}


function prettyDate(value) {

  const date =
    parseDate(value);


  return (
    `${date.getMonth() + 1}月` +
    `${date.getDate()}日`
  );

}


function addDays(
  value,
  number
) {

  const date =
    parseDate(value);


  date.setDate(
    date.getDate() +
    number
  );


  return formatDate(
    date
  );

}


function daysBetween(
  start,
  end
) {

  const a =
    parseDate(start);


  const b =
    parseDate(end);


  return Math.floor(
    (
      b.getTime() -
      a.getTime()
    ) /
    86400000
  );

}


/* =========================================================
   当前时间
========================================================= */

function updateClock() {

  const now =
    getBeijingNow();


  document
    .getElementById(
      "currentTime"
    )
    .textContent =

    `${now.date} ` +
    `${now.time} ` +
    `北京时间`;

}


updateClock();


setInterval(
  updateClock,
  1000
);


/* =========================================================
   第一阶段历史记录展开 / 收起
========================================================= */

function toggleDydrogesteroneHistory() {

  const history =
    document.getElementById(
      "dydrogesteroneHistory"
    );


  const arrow =
    document.getElementById(
      "historyArrow"
    );


  const text =
    document.getElementById(
      "historyToggleText"
    );


  const isHidden =
    history.classList.contains(
      "hidden"
    );


  if (isHidden) {

    history.classList.remove(
      "hidden"
    );


    arrow.textContent =
      "⌃";


    text.textContent =
      "收起详细记录";

  } else {

    history.classList.add(
      "hidden"
    );


    arrow.textContent =
      "⌄";


    text.textContent =
      "查看详细记录";

  }

}


/* =========================================================
   等待期
========================================================= */

function renderWaiting() {

  const now =
    getBeijingNow();


  const difference =
    daysBetween(
      WAITING_START,
      now.date
    );


  let day =
    difference + 1;


  if (day < 1) {

    day = 1;

  }


  const displayDay =
    Math.min(
      day,
      WAITING_DAYS
    );


  document
    .getElementById(
      "waitingDay"
    )
    .textContent =
    `Day ${displayDay}`;


  const percent =
    Math.min(
      100,
      Math.max(
        0,
        (
          displayDay /
          WAITING_DAYS
        ) * 100
      )
    );


  document
    .getElementById(
      "waitingProgress"
    )
    .style.width =
    `${percent}%`;


  let text;


  if (
    difference <
    WAITING_DAYS
  ) {

    const remaining =
      Math.max(
        0,
        WAITING_DAYS -
        difference -
        1
      );


    if (
      remaining > 0
    ) {

      text =
        `观察期第 ${day} 天，` +
        `之后还有 ${remaining} 天`;

    } else {

      text =
        "今天是 7 天观察期的最后一天";

    }

  } else {

    text =
      "7 天观察期已经结束";

  }


  document
    .getElementById(
      "waitingText"
    )
    .textContent =
    text;

}


/* =========================================================
   姨妈弹窗
========================================================= */

function openPeriodModal() {

  const now =
    getBeijingNow();


  document
    .getElementById(
      "periodDateInput"
    )
    .value =
    state.periodStart ||
    now.date;


  document
    .getElementById(
      "periodModal"
    )
    .classList
    .remove(
      "hidden"
    );

}


function closePeriodModal() {

  document
    .getElementById(
      "periodModal"
    )
    .classList
    .add(
      "hidden"
    );

}


/* =========================================================
   确认姨妈开始
========================================================= */

function confirmPeriodStart() {

  const date =
    document
      .getElementById(
        "periodDateInput"
      )
      .value;


  if (!date) {

    alert(
      "请选择姨妈开始日期"
    );

    return;

  }


  const now =
    getBeijingNow();


  if (
    parseDate(date) >
    parseDate(now.date)
  ) {

    alert(
      "姨妈开始日期不能晚于今天"
    );

    return;

  }


  if (
    state.periodStart &&
    state.periodStart !==
      date &&
    Object.keys(
      state.yasminTaken
    ).length
  ) {

    const confirmed =
      confirm(
        "修改姨妈开始日期后，" +
        "优思明 21 天日期会重新计算。" +
        "已有优思明打卡记录也会清空。\n\n" +
        "确定修改吗？"
      );


    if (!confirmed) {

      return;

    }


    state.yasminTaken =
      {};

  }


  state.periodStart =
    date;


  saveState();

  closePeriodModal();

  renderAll();

}


/* =========================================================
   修改姨妈日期
========================================================= */

function editPeriodDate() {

  openPeriodModal();

}


/* =========================================================
   月经追踪
========================================================= */

function renderPeriod() {

  const waitingSection =
    document.getElementById(
      "waitingSection"
    );


  const periodSection =
    document.getElementById(
      "periodSection"
    );


  const yasminSection =
    document.getElementById(
      "yasminSection"
    );


  const resetSection =
    document.getElementById(
      "resetSection"
    );


  if (
    !state.periodStart
  ) {

    waitingSection
      .classList
      .remove(
        "hidden"
      );


    periodSection
      .classList
      .add(
        "hidden"
      );


    yasminSection
      .classList
      .add(
        "hidden"
      );


    resetSection
      .classList
      .add(
        "hidden"
      );


    return;

  }


  waitingSection
    .classList
    .add(
      "hidden"
    );


  periodSection
    .classList
    .remove(
      "hidden"
    );


  yasminSection
    .classList
    .remove(
      "hidden"
    );


  resetSection
    .classList
    .remove(
      "hidden"
    );


  const now =
    getBeijingNow();


  let currentDay =
    daysBetween(
      state.periodStart,
      now.date
    ) + 1;


  if (
    currentDay < 1
  ) {

    currentDay = 1;

  }


  document
    .getElementById(
      "periodStartDisplay"
    )
    .textContent =
    prettyDate(
      state.periodStart
    );


  document
    .getElementById(
      "currentPeriodDay"
    )
    .textContent =
    `Day ${currentDay}`;


  document
    .getElementById(
      "periodDayBadge"
    )
    .textContent =
    `Day ${currentDay}`;


  /*
     Day 1 = 月经开始当天
     Day 5 = Day 1 + 4天
  */

  const day5 =
    addDays(
      state.periodStart,
      4
    );


  document
    .getElementById(
      "day5Date"
    )
    .textContent =
    prettyDate(day5);

}


/* =========================================================
   优思明时间设置
========================================================= */

function toggleTimeEditor() {

  const editor =
    document.getElementById(
      "timeEditor"
    );


  editor
    .classList
    .toggle(
      "hidden"
    );


  document
    .getElementById(
      "medicineTimeInput"
    )
    .value =
    state.medicineTime;

}


function saveMedicineTime() {

  const value =
    document
      .getElementById(
        "medicineTimeInput"
      )
      .value;


  if (!value) {

    alert(
      "请选择服药时间"
    );

    return;

  }


  state.medicineTime =
    value;


  saveState();


  document
    .getElementById(
      "timeEditor"
    )
    .classList
    .add(
      "hidden"
    );


  renderYasmin();

}


/* =========================================================
   优思明开始日期
========================================================= */

function getYasminStart() {

  if (
    !state.periodStart
  ) {

    return null;

  }


  return addDays(
    state.periodStart,
    4
  );

}


/* =========================================================
   优思明 Timeline
========================================================= */

function renderYasmin() {

  if (
    !state.periodStart
  ) {

    return;

  }


  const start =
    getYasminStart();


  const now =
    getBeijingNow();


  document
    .getElementById(
      "medicineTimeDisplay"
    )
    .textContent =
    state.medicineTime;


  const takenCount =
    Object.values(
      state.yasminTaken
    )
      .filter(Boolean)
      .length;


  const remaining =
    YASMIN_TOTAL -
    takenCount;


  const percent =
    Math.round(
      (
        takenCount /
        YASMIN_TOTAL
      ) * 100
    );


  document
    .getElementById(
      "takenCount"
    )
    .textContent =
    takenCount;


  document
    .getElementById(
      "remainingCount"
    )
    .textContent =
    remaining;


  document
    .getElementById(
      "medicinePercent"
    )
    .textContent =
    `${percent}%`;


  document
    .getElementById(
      "medicineProgressFill"
    )
    .style.width =
    `${percent}%`;


  const status =
    document.getElementById(
      "yasminStatus"
    );


  if (
    takenCount >=
    YASMIN_TOTAL
  ) {

    status.textContent =
      "✓ 已完成";

  } else if (
    parseDate(now.date) <
    parseDate(start)
  ) {

    status.textContent =
      "等待开始";

  } else {

    status.textContent =
      "进行中";

  }


  const timeline =
    document.getElementById(
      "medicineTimeline"
    );


  timeline.innerHTML =
    "";


  let nextDose =
    null;


  for (
    let i = 0;
    i < YASMIN_TOTAL;
    i++
  ) {

    const doseNumber =
      i + 1;


    const doseDate =
      addDays(
        start,
        i
      );


    const taken =
      !!state.yasminTaken[
        doseNumber
      ];


    if (
      !taken &&
      !nextDose &&
      parseDate(doseDate) >=
        parseDate(now.date)
    ) {

      nextDose = {

        number:
          doseNumber,

        date:
          doseDate

      };

    }


    const item =
      document.createElement(
        "div"
      );


    item.className =
      "dose-item";


    if (
      doseDate ===
      now.date
    ) {

      item.classList.add(
        "today"
      );

    }


    if (taken) {

      item.classList.add(
        "taken"
      );

    }


    item.innerHTML = `

      <div class="dose-number">
        ${doseNumber}
      </div>

      <div class="dose-info">

        <strong>
          第 ${doseNumber} 片
          ·
          ${prettyDate(doseDate)}
        </strong>

        <span>
          ${state.medicineTime}
          ${
            doseDate === now.date
              ? " · 今天"
              : ""
          }
        </span>

      </div>

      <button
        class="check-button"
        onclick="toggleDose(${doseNumber})"
      >
        ${
          taken
            ? "✓ 已服"
            : "打卡"
        }
      </button>

    `;


    timeline.appendChild(
      item
    );

  }


  const nextMedicine =
    document.getElementById(
      "nextMedicine"
    );


  const nextHint =
    document.getElementById(
      "nextMedicineHint"
    );


  if (
    takenCount >=
    YASMIN_TOTAL
  ) {

    nextMedicine.textContent =
      "21 天已完成";


    nextHint.textContent =
      "本周期全部打卡完成 🎉";

  } else if (
    parseDate(now.date) <
    parseDate(start)
  ) {

    nextMedicine.textContent =
      `${prettyDate(start)} ${state.medicineTime}`;


    nextHint.textContent =
      "月经 Day 5 开始";

  } else if (
    nextDose
  ) {

    nextMedicine.textContent =
      `${prettyDate(nextDose.date)} ${state.medicineTime}`;


    nextHint.textContent =
      `第 ${nextDose.number} 片`;

  } else {

    const firstUntaken =
      Array
        .from(
          {
            length:
              YASMIN_TOTAL
          },
          (_, index) =>
            index + 1
        )
        .find(
          number =>
            !state.yasminTaken[
              number
            ]
        );


    if (firstUntaken) {

      const missedDate =
        addDays(
          start,
          firstUntaken - 1
        );


      nextMedicine.textContent =
        `${prettyDate(missedDate)} ${state.medicineTime}`;


      nextHint.textContent =
        `第 ${firstUntaken} 片尚未打卡`;

    }

  }

}


/* =========================================================
   优思明打卡
========================================================= */

function toggleDose(
  number
) {

  const currentlyTaken =
    !!state.yasminTaken[
      number
    ];


  if (currentlyTaken) {

    const confirmed =
      confirm(
        `确定取消第 ${number} 片的打卡吗？`
      );


    if (!confirmed) {

      return;

    }


    delete state.yasminTaken[
      number
    ];

  } else {

    state.yasminTaken[
      number
    ] = {

      taken:
        true,

      checkedAt:
        new Date()
          .toISOString()

    };

  }


  saveState();

  renderYasmin();

}


/* =========================================================
   重新记录周期
========================================================= */

function resetPeriodCycle() {

  const confirmed =
    confirm(
      "确定重新记录本次姨妈吗？\n\n" +
      "姨妈开始日期和优思明 21 天打卡记录都会清空。"
    );


  if (!confirmed) {

    return;

  }


  state.periodStart =
    null;


  state.yasminTaken =
    {};


  saveState();

  renderAll();

}


/* =========================================================
   总渲染
========================================================= */

function renderAll() {

  renderWaiting();

  renderPeriod();


  if (
    state.periodStart
  ) {

    renderYasmin();

  }

}


/* =========================================================
   初始化
========================================================= */

renderAll();


setInterval(
  renderAll,
  60000
);