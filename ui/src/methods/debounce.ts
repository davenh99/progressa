export function debounce<F extends (...args: any[]) => void>(fn: F, ms = 500) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
