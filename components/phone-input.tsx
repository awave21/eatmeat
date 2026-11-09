import type {ClipboardEvent, KeyboardEvent} from 'react';

const digitsOnly = (value: string) => value.replace(/\D/g, '');

function readPhone(value: string) {
  const digits = digitsOnly(value);
  const hasPrefix = /^\s*\+7|^\s*7\s*\(/.test(value) || (digits.length === 11 && /^[78]/.test(digits));
  const prefixLength = hasPrefix ? 1 : 0;
  return {digits: digits.slice(prefixLength, prefixLength + 10), prefixLength};
}

function formatPhone(digits: string) {
  let value = '+7';
  if (digits.length > 0) value += ' (' + digits.slice(0, 3);
  if (digits.length > 3) value += ') ' + digits.slice(3, 6);
  if (digits.length > 6) value += '-' + digits.slice(6, 8);
  if (digits.length > 8) value += '-' + digits.slice(8, 10);
  return value;
}

export default function PhoneInput({initialValue, onValueChange}: {
  initialValue: string;
  onValueChange: (value: string) => void;
}) {
  function update(input: HTMLInputElement, raw = input.value, cursor = input.selectionStart ?? raw.length) {
    const {digits, prefixLength} = readPhone(raw);
    const value = formatPhone(digits);
    const digitsBeforeCursor = Math.max(0, digitsOnly(raw.slice(0, cursor)).length - prefixLength);
    let position = 2;
    let remaining = digitsBeforeCursor;
    while (position < value.length && remaining > 0) {
      if (/\d/.test(value[position])) remaining--;
      position++;
    }
    input.value = value;
    input.setSelectionRange(position, position);
    onValueChange(value);
  }

  function paste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text');
    const digits = digitsOnly(text);
    if (digits.length !== 10 && !(digits.length === 11 && /^[78]/.test(digits))) return;
    event.preventDefault();
    update(event.currentTarget, text, text.length);
  }

  function deleteDigit(event: KeyboardEvent<HTMLInputElement>) {
    const backward = event.key === 'Backspace';
    if (!backward && event.key !== 'Delete') return;
    const input = event.currentTarget;
    const cursor = input.selectionStart ?? 2;
    if (cursor !== input.selectionEnd) return;
    const adjacent = backward ? cursor - 1 : cursor;
    if (adjacent < 2) {
      event.preventDefault();
      return;
    }
    if (!input.value[adjacent] || /\d/.test(input.value[adjacent])) return;

    const searchFrom = backward ? 2 : cursor;
    const segment = backward ? input.value.slice(searchFrom, cursor) : input.value.slice(searchFrom);
    const digit = segment.search(backward ? /\d(?=\D*$)/ : /\d/);
    if (digit < 0) return;
    event.preventDefault();
    const index = searchFrom + digit;
    input.setRangeText('', index, index + 1, 'end');
    update(input);
  }

  return <input
    name="phone"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    required
    defaultValue={formatPhone(readPhone(initialValue).digits)}
    pattern={String.raw`\+7 \([0-9]{3}\) [0-9]{3}-[0-9]{2}-[0-9]{2}`}
    title="Введите 10 цифр после +7"
    onInput={event=>update(event.currentTarget)}
    onPaste={paste}
    onKeyDown={deleteDigit}
    onSelect={event=>{
      const input = event.currentTarget;
      if ((input.selectionEnd ?? 2) < 2) input.setSelectionRange(2, 2);
    }}
  />;
}
