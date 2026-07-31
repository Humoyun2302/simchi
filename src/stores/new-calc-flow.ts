import { create } from 'zustand'
import { useAppDataStore } from '@/stores/app-data-store'

interface NewCalcFlowState {
  dialogOpen: boolean
  requestNewCalc: (navigate: (path: string) => void) => void
  continueDraft: (navigate: (path: string) => void) => void
  startFresh: (navigate: (path: string) => void) => void
  cancel: () => void
}

/**
 * Coordinates "Новый расчёт" entry points:
 * unfinished draft dialog vs clean wizard session.
 */
export const useNewCalcFlow = create<NewCalcFlowState>((set) => ({
  dialogOpen: false,

  requestNewCalc: (navigate) => {
    const dirty = useAppDataStore.getState().hasUnfinishedWizard()
    if (dirty) {
      set({ dialogOpen: true })
      return
    }
    useAppDataStore.getState().startFreshWizard()
    navigate('/projects/new')
  },

  continueDraft: (navigate) => {
    useAppDataStore.getState().continueWizardDraft()
    set({ dialogOpen: false })
    navigate('/projects/new')
  },

  startFresh: (navigate) => {
    useAppDataStore.getState().startFreshWizard()
    set({ dialogOpen: false })
    navigate('/projects/new')
  },

  cancel: () => set({ dialogOpen: false }),
}))
