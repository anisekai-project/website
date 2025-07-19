import type {SearchHandler}  from '~/types/interfaces';
import type {SearchProvider} from '~/types/types';


const noop = () => {
};

export default <T>(provider: SearchProvider<T>, timeout: number = 0, minSearchLength: number = 0, onSearchDone: (success: boolean) => void = noop): SearchHandler<T> => {

  const filter: Ref<string> = ref('');
  const state: Ref<string>  = ref('Aucune option disponible.');
  const results: Ref<T[]>   = ref([]);
  const count: Ref<number>  = computed(() => results.value.length);

  const {action} = useDebounce(filter, async () => {
    results.value = [];
    state.value   = 'Recherche en cours...';

    try {
      results.value = await provider(filter.value);

      if (count.value === 0) {
        state.value = 'Aucune option disponible.';
      } else {
        state.value = `${count.value} option(s) disponible(s)`;
      }

      onSearchDone(true);
    } catch (e) {
      results.value = [];
      state.value   = 'Une erreur est survenue lors de la recherche.';
      console.error(e);
      onSearchDone(false);
    }
  }, timeout);

  if (minSearchLength === 0) {
    action('');
  }

  return {filter, results, count, state, action};
}
