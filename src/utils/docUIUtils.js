/* eslint-disable no-param-reassign */
export default function adjustLine(from, to, line) {
  if (from === undefined || to === undefined || line === undefined) { return; }
  const fT = from.offsetTop + from.offsetHeight / 2;
  const tT = to.offsetTop 	 + to.offsetHeight / 2;
  const fL = from.offsetLeft + from.offsetWidth / 2;
  const tL = to.offsetLeft 	 + to.offsetWidth / 2;

  const CA = Math.abs(tT - fT);
  const CO = Math.abs(tL - fL);
  const H = Math.sqrt(CA * CA + CO * CO);
  let ANG = (180 / Math.PI) * Math.acos(CA / H);
  let top;
  let left;

  if (tT > fT) {
    top = (tT - fT) / 2 + fT;
  } else {
    top = (fT - tT) / 2 + tT;
  }
  if (tL > fL) {
    left = (tL - fL) / 2 + fL;
  } else {
    left = (fL - tL) / 2 + tL;
  }

  if ((fT < tT && fL < tL)
  || (tT < fT && tL < fL)
  || (fT > tT && fL > tL)
  || (tT > fT && tL > fL)) {
    ANG *= -1;
  }
  top -= H / 2;

  line.style['-webkit-transform'] = `rotate(${ANG}deg)`;
  line.style['-moz-transform'] = `rotate(${ANG}deg)`;
  line.style['-ms-transform'] = `rotate(${ANG}deg)`;
  line.style['-o-transform'] = `rotate(${ANG}deg)`;
  line.style['-transform'] = `rotate(${ANG}deg)`;
  line.style.top = `${top}px`;
  line.style.left = `${left}px`;
  line.style.height = `${H}px`;
}

export function mapRanges(input, istart, iend, ostart, oend) {
  return ostart + ((oend - ostart) / (iend - istart)) * (input - istart);
}

export function DeepCopyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export const RID = () => {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rid = '';
  for (let i = 0; i < 15; i += 1) {
    const r = Math.random() * c.length;
    rid += c.substring(r, r + 1);
  }
  return rid;
};

export const debounce = (func, wait, options) => {
  let timeout;
  return function executedFunction() {
    const later = (opts) => {
      clearTimeout(timeout);
      func(opts);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait, options);
  };
};
