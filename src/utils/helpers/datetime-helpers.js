function compareTime(timeString1, timeString2) {
  const dateTime1 = new Date(timeString1);
  const dateTime2 = new Date(timeString2);
  const result = dateTime1.getTime() > dateTime2.getTime();
  return result;
}

module.exports = {
  compareTime,
};
