// StatsDashboard.tsx
import { DB, Incident } from 'types'
import React, { useMemo, useReducer } from 'react'
import IncidentTable from '@/components/IncidentTable'
import StatisticsFilterBar from '@/components/StatisticsFilterBar'

export type filterDispatchType = { type: 'ADD_FILTER' | 'REMOVE_FILTER' | 'UPDATE_FILTER'; payload: Partial<filterType> }

export type filterProps = {
  id: number
  data: DB
  dispatch: React.Dispatch<filterDispatchType>
  operation?: (incident: Incident) => boolean
  state?: any
}

export type filterType = {
  id: number
  component: React.FC<filterProps>
  state?: any
  operation?: (incident: Incident) => boolean
}

type filterState = {
  index: number
  filters: filterType[]
}

interface StatsDashboardProps {
  data: DB
}

/**
 * The idea is that the user can add and layer filters on top of each other to filter the incidents.
 * Each filter has...
 * - an id - a unique identifier for the filter used to remove or update it
 * - a component that is displayed in the filter bar, displays the state of its filter, and can be clicked on to modify or remove the filter.
 * - a state - some filters might need to store some state, maybe.
 * - an operation - a function that takes an incident and returns a boolean. If the incident passes the filter, the function should return true.
 *
 * The filter bar is a horizontal bar that displays all the filters that have been added. It also has a button to add a new filter from a list.
 */
const filterReducer = (state: filterState, action: filterDispatchType) => {
  let newState = state
  switch (action.type) {
    case 'ADD_FILTER':
      const id = state.index
      const newFilter = { id, ...action.payload } as filterType
      newState = { index: state.index + 1, filters: [...state.filters, newFilter] }
      break
    case 'REMOVE_FILTER':
      newState = { ...state, filters: state.filters.filter((filter) => filter.id !== action.payload.id) }
      break
    case 'UPDATE_FILTER':
      newState = { ...state, filters: state.filters.map((filter) => (filter.id === action.payload.id ? { ...filter, ...action.payload } : filter)) }
      break
  }
  return newState
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ data }) => {
  const incidents: [string, Incident][] = Object.entries(data.Incidents)
  const [filters, dispatchFilters] = useReducer(filterReducer, { index: 0, filters: [] })
  const filteredIncidents = useMemo(() => {
    return incidents.filter(([, incident]) => filters.filters.every((filter) => (filter.operation ? filter.operation(incident) : true)))
  }, [incidents, filters])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Estadísticas</h1>
      <StatisticsFilterBar data={data} filters={filters.filters} dispatchFilters={dispatchFilters} />
      <IncidentTable data={data} incidents={filteredIncidents} />
    </div>
  )
}

export default StatsDashboard
