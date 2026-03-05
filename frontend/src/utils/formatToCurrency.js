/* eslint-disable new-cap */
import { getFormatLocale } from "./formatLocale";

export default function formatToCurrency(value, currency = "BRL") {
  return Intl.NumberFormat(getFormatLocale(), {
    style: "currency",
    currency,
  }).format(value);
}
