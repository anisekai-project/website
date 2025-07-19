export interface SelectOption {
  value: string | int,
  label: string,
  active?: boolean,
  selected?: boolean
}

export interface SearchHandler<T> {
  filter: Ref<string>,
  results: Ref<T[]>
  count: Ref<number>,
  state: Ref<string>,
  action: (filter: string) => void
}
