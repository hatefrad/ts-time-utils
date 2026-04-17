# Vue Integration Guide

## Installation

```bash
npm install ts-time-utils
```

## Composables

### useRelativeTime

Auto-updating relative time:

```ts
// composables/useRelativeTime.ts
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { timeAgo } from 'ts-time-utils/format';

export function useRelativeTime(date: Date | (() => Date), intervalMs = 60000) {
  const getDate = () => (typeof date === 'function' ? date() : date);
  const text = ref(timeAgo(getDate()));
  let timer: ReturnType<typeof setInterval>;

  const update = () => {
    text.value = timeAgo(getDate());
  };

  onMounted(() => {
    timer = setInterval(update, intervalMs);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  watch(() => getDate(), update);

  return text;
}
```

```vue
<script setup lang="ts">
import { useRelativeTime } from '@/composables/useRelativeTime';

const props = defineProps<{ createdAt: Date }>();
const timeAgo = useRelativeTime(() => props.createdAt);
</script>

<template>
  <span>{{ timeAgo }}</span>
</template>
```

### useCountdown

Reactive countdown timer:

```ts
// composables/useCountdown.ts
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getRemainingTime } from 'ts-time-utils/countdown';

export function useCountdown(targetDate: Date) {
  const remaining = ref(getRemainingTime(targetDate));
  let timer: ReturnType<typeof setInterval>;

  onMounted(() => {
    timer = setInterval(() => {
      remaining.value = getRemainingTime(targetDate);
      if (remaining.value.totalMilliseconds <= 0) clearInterval(timer);
    }, 1000);
  });

  onUnmounted(() => clearInterval(timer));

  const isExpired = computed(() => remaining.value.isExpired);

  return { remaining, isExpired };
}
```

```vue
<script setup lang="ts">
import { useCountdown } from '@/composables/useCountdown';

const props = defineProps<{ endsAt: Date }>();
const { remaining, isExpired } = useCountdown(props.endsAt);
</script>

<template>
  <span v-if="isExpired">Expired</span>
  <span v-else>
    {{ remaining.days }}d {{ remaining.hours }}h {{ remaining.minutes }}m {{ remaining.seconds }}s
  </span>
</template>
```

### useDateValidation

Form validation composable:

```ts
// composables/useDateValidation.ts
import { ref, computed } from 'vue';
import { isValidDate, isFuture, isPast } from 'ts-time-utils/validate';
import { parseDate } from 'ts-time-utils/parse';

interface ValidationRules {
  required?: boolean;
  future?: boolean;
  past?: boolean;
}

export function useDateValidation(rules: ValidationRules = {}) {
  const value = ref('');
  const touched = ref(false);

  const error = computed(() => {
    if (!touched.value) return null;

    if (!value.value && rules.required) return 'Date is required';

    const date = parseDate(value.value);
    if (!date || !isValidDate(date)) return 'Invalid date format';
    if (rules.future && !isFuture(date)) return 'Date must be in the future';
    if (rules.past && !isPast(date)) return 'Date must be in the past';

    return null;
  });

  const isValid = computed(() => touched.value && !error.value);

  return { value, touched, error, isValid };
}
```

```vue
<script setup lang="ts">
import { useDateValidation } from '@/composables/useDateValidation';

const { value, touched, error, isValid } = useDateValidation({
  required: true,
  future: true
});
</script>

<template>
  <div>
    <input
      type="date"
      v-model="value"
      @blur="touched = true"
      :class="{ error: error }"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

## Components

### FormattedDate.vue

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { formatDateLocale } from 'ts-time-utils/locale';

const props = withDefaults(defineProps<{
  date: Date;
  locale?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
}>(), {
  locale: 'en-US',
  format: 'medium'
});

const formatted = computed(() =>
  formatDateLocale(props.date, props.locale, props.format)
);
</script>

<template>
  <time :datetime="date.toISOString()">{{ formatted }}</time>
</template>
```

### BusinessHours.vue

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { isWorkingTime, nextWorkingTime } from 'ts-time-utils/workingHours';
import { timeAgo } from 'ts-time-utils/format';

const config = {
  workingDays: [1, 2, 3, 4, 5],
  hours: { start: 9, end: 17 },
  breaks: [{ start: 12, end: 13 }]
};

const isOpen = ref(false);
const nextOpenText = ref('');
let timer: ReturnType<typeof setInterval>;

const update = () => {
  const now = new Date();
  isOpen.value = isWorkingTime(now, config);
  if (!isOpen.value) {
    const next = nextWorkingTime(now, config);
    nextOpenText.value = next ? `Opens ${timeAgo(next)}` : '';
  }
};

onMounted(() => {
  update();
  timer = setInterval(update, 60000);
});

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div>
    <span :class="isOpen ? 'open' : 'closed'">
      {{ isOpen ? 'Open' : 'Closed' }}
    </span>
    <span v-if="!isOpen && nextOpenText">{{ nextOpenText }}</span>
  </div>
</template>
```

## Vee-Validate Integration

```vue
<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { parseDate } from 'ts-time-utils/parse';
import { isValidDate, isFuture } from 'ts-time-utils/validate';

const validateFutureDate = (value: string) => {
  if (!value) return 'Date is required';
  const date = parseDate(value);
  if (!date || !isValidDate(date)) return 'Invalid date';
  if (!isFuture(date)) return 'Must be a future date';
  return true;
};

const { handleSubmit } = useForm();
const { value, errorMessage } = useField('eventDate', validateFutureDate);
</script>

<template>
  <form @submit="handleSubmit(values => console.log(values))">
    <input type="date" v-model="value" />
    <span v-if="errorMessage">{{ errorMessage }}</span>
    <button type="submit">Submit</button>
  </form>
</template>
```

## Tree-Shaking Tips

```ts
// Good - only imports format module (~3KB)
import { timeAgo } from 'ts-time-utils/format';

// Avoid - imports entire library
import { timeAgo } from 'ts-time-utils';
```
