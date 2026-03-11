# Web

React SPA frontend. Communicates with the API via [Eden Treaty](https://elysiajs.com/eden/treaty.html) — a fully type-safe HTTP client derived from the Elysia server's type export.

---

## Architecture

```
src/
├── main.tsx            # React entry point
├── router.ts           # TanStack Router instance
├── env.ts              # Zod-validated environment variables
├── routes/             # File-based routes (TanStack Router)
├── components/         # Reusable UI components
├── hooks/
│   └── api/            # TanStack Query hooks + query key factories
├── lib/
│   ├── api.ts          # Eden Treaty client (typed against API)
│   ├── api-utils.ts    # Error message extraction
│   ├── query-client.ts # TanStack Query configuration
│   └── utils.ts        # cn() Tailwind class utility
└── providers/
    └── QueryProvider.tsx
```

---

## Adding a New Route

1. Create `src/routes/your-entity/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/your-entity/')({
	component: YourEntityPage,
});

function YourEntityPage() {
	return <div>Your Entity</div>;
}
```

2. TanStack Router automatically picks up the file and regenerates `src/routeTree.gen.ts`.

3. Add a nav link in `src/components/TopBar/TopBar.tsx` if needed.

---

## Adding a New API Hook

```typescript
// src/hooks/api/useYourEntity.ts
import { queryOptions, useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api';

export const yourEntityQueryOptions = () =>
	queryOptions({
		queryKey: ['yourEntity'],
		queryFn: async () => {
			const { data, error } = await client.api['your-entity'].get();
			if (error) throw error;
			return data;
		},
	});

export function useYourEntity() {
	return useQuery(yourEntityQueryOptions());
}
```

---

## Generic UI Components

The following ready-to-use components are in `src/components/`:

| Component           | Description                                  |
| ------------------- | -------------------------------------------- |
| `Badge`             | Status/label badge with color variants       |
| `BadgeList`         | Wrapping list of badges                      |
| `Button`            | Button with size/variant/loading states      |
| `ButtonIcon`        | Icon-only button                             |
| `CheckboxInput`     | Accessible checkbox                          |
| `ConfirmationModal` | Confirm/cancel dialog                        |
| `DataTable`         | Sortable table with column definitions       |
| `DropdownMenu`      | Click-triggered dropdown menu                |
| `Input`             | Text input with label and error state        |
| `Modal`             | Headless UI dialog (sm/md/lg/xl sizes)       |
| `PageHeader`        | Page title + action slot                     |
| `SelectInput`       | Single, searchable, or multi-select dropdown |
| `Slider`            | Range slider                                 |
| `TextLink`          | Styled anchor/router link                    |
| `Toggle`            | On/off toggle switch                         |
| `Tooltip`           | Floating tooltip via `@floating-ui/react`    |

---

## Testing

Component tests use Vitest + Testing Library. Collocate tests as `[Name].test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { MyComponent } from './MyComponent';

vi.mock('@/hooks/api', () => ({ useYourEntity: () => ({ data: [] }) }));

test('renders', () => {
	render(
		<QueryClientProvider client={new QueryClient()}>
			<MyComponent />
		</QueryClientProvider>
	);
	expect(screen.getByText('...')).toBeInTheDocument();
});
```
