const setItem = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const setObjectInLocalStorage = (key: string, value: object) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const getItem = (key: string) => {
  let val = localStorage.getItem(key);
  let parsedVal = val ? JSON.parse(val) : null;
  return parsedVal;
};

const getSingleItem = (key: string) => {
  return localStorage.getItem(key);
};

export { setItem, getItem, getSingleItem, setObjectInLocalStorage };