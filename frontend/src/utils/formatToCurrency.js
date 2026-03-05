/* eslint-disable new-cap */
import { getFormatLocale } from "./formatLocale";

export default function formatToCurrency(value, currency = "USD") {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}
