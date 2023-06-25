export function logPretty(id: string, header: string, body: string) {
  console.log(`${id} | ${header} -----`);
  console.log(body);
  console.log('-----');
}

export function generateLogId(): string {
  return Math.random().toString().substring(2, 7);
}