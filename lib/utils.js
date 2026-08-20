import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'angry', label: 'Angry', emoji: '😡', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'excited', label: 'Excited', emoji: '😍', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'anxious', label: 'Anxious', emoji: '😨', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'loved', label: 'Loved', emoji: '❤️', color: 'bg-rose-100 text-rose-800 border-rose-200' },
]

export const WEATHER_OPTIONS = [
  { value: 'sunny', label: 'Sunny', emoji: '☀️' },
  { value: 'cloudy', label: 'Cloudy', emoji: '☁️' },
  { value: 'rainy', label: 'Rainy', emoji: '🌧️' },
  { value: 'snowy', label: 'Snowy', emoji: '❄️' },
  { value: 'windy', label: 'Windy', emoji: '💨' },
  { value: 'stormy', label: 'Stormy', emoji: '⛈️' },
  { value: 'foggy', label: 'Foggy', emoji: '🌫️' },
  { value: 'partly-cloudy', label: 'Partly Cloudy', emoji: '⛅' },
]

export function getMoodByValue(value) {
  return MOODS.find((m) => m.value === value) || null
}

export function getWeatherByValue(value) {
  return WEATHER_OPTIONS.find((w) => w.value === value) || null
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncate(str, n = 150) {
  return str?.length > n ? str.slice(0, n) + '...' : str
}
