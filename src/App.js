import { Button, CssBaseline, InputLabel, MenuItem, TextField } from '@material-ui/core'
import React, { useEffect, useState, useMemo } from 'react'

import { Page } from './Page'
import { Table } from './Table'
import AuthService from './auth.service'

// This is a custom aggregator that
// takes in an array of values and
// returns the rounded median
function roundedMedian(values) {
  let min = values[0] || ''
  let max = values[0] || ''

  values.forEach((value) => {
    min = Math.min(min, value)
    max = Math.max(max, value)
  })

  return Math.round((min + max) / 2)
}

function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id[0]]
    return rowValue >= filterValue
  })
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== 'number'

function SelectColumnFilter({
  column: { filterValue, render, setFilter, preFilteredRows, id },
}) {
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach((row) => {
      options.add(row.values[id])
    })
    return [...Array.from(options.values())]
  }, [id, preFilteredRows])

  return (
    <TextField
      select
      label={render('Header')}
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined)
      }}
    >
      <MenuItem value={''}>All</MenuItem>
      {options.map((option, i) => (
        <MenuItem key={i} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  )
}

const getMinMax = (rows, id) => {
  let min = rows.length ? rows[0].values[id] : 0
  let max = rows.length ? rows[0].values[id] : 0
  rows.forEach((row) => {
    min = Math.min(row.values[id], min)
    max = Math.max(row.values[id], max)
  })
  return [min, max]
}

// function SliderColumnFilter({
//   column: { render, filterValue, setFilter, preFilteredRows, id },
// }) {
//   const [min, max] = React.useMemo(() => getMinMax(preFilteredRows, id), [id, preFilteredRows])

//   return (
//     <div
//       style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'baseline',
//       }}
//     >
//       <TextField
//         name={id}
//         label={render('Header')}
//         type='range'
//         inputProps={{
//           min,
//           max,
//         }}
//         value={filterValue || min}
//         onChange={(e) => {
//           setFilter(parseInt(e.target.value, 10))
//         }}
//       />
//       <Button variant='outlined' style={{ width: 60, height: 36 }} onClick={() => setFilter(undefined)}>
//         Off
//       </Button>
//     </div>
//   )
// }

const useActiveElement = () => {
  const [active, setActive] = React.useState(document.activeElement)

  const handleFocusIn = () => {
    setActive(document.activeElement)
  }

  React.useEffect(() => {
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [])

  return active
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { filterValue = [], render, preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => getMinMax(preFilteredRows, id), [id, preFilteredRows])
  const focusedElement = useActiveElement()
  const hasFocus = focusedElement && (focusedElement.id === `${id}_1` || focusedElement.id === `${id}_2`)
  return (
    <>
      <InputLabel htmlFor={id} shrink focused={!!hasFocus}>
        {render('Header')}
      </InputLabel>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 5,
        }}
      >
        <TextField
          id={`${id}_1`}
          value={filterValue[0] || ''}
          type='number'
          onChange={(e) => {
            const val = e.target.value
            setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
          }}
          placeholder={`Min (${min})`}
          style={{
            width: '70px',
            marginRight: '0.5rem',
          }}
        />
        to
        <TextField
          id={`${id}_2`}
          value={filterValue[1] || ''}
          type='number'
          onChange={(e) => {
            const val = e.target.value
            setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
          }}
          placeholder={`Max (${max})`}
          style={{
            width: '70px',
            marginLeft: '0.5rem',
          }}
        />
      </div>
    </>
  )
}

const columns = [
  { Header: "Faktura", accessor: "InvoiceNumber", id: "invoiceNumber", filter: 'fuzzyText', },
  { Header: "BookingId", accessor: "BookingId", id: "bookingId", filter: 'fuzzyText', },
  { 
    Header: "Status", 
    accessor: "OrderStatus",
    id: "orderStatus",
    Filter: SelectColumnFilter,
    filter: 'includes' 
  },
  { 
    Header: "Massør", 
    accessor: "Alias",
    id: "alias",
    Filter: SelectColumnFilter,
    filter: 'includes'  
  },
  { 
    Header: "Behandlingstype", 
    accessor: "STypeName",
    id: "sTypeName",
    Filter: SelectColumnFilter,
    filter: 'includes'  
  },
  { Header: "Behandlingsdato", accessor: "ServiceDate", id: "serviceDate" },
  { Header: "Navn", accessor: "Navn", id: "navn", filter: 'fuzzyText' },
  { Header: "Tlf", accessor: "CPhone", id: "cPhone", filter: 'fuzzyText' },
  { Header: "Email", accessor: "CEmail", id: "cEmail", filter: 'fuzzyText' },
  { Header: "Adresse", accessor: "OrderAddress", id: "orderAddress", filter: 'fuzzyText' },
  { Header: "Postnr", accessor: "ZipCode", id: "zipCode", filter: 'fuzzyText' },
  { Header: "Area", accessor: "AreaName", id: "areaName", filter: 'fuzzyText' },
  { Header: "Klippe-/Gavekode", accessor: "GiftCardID", id: "giftCardID", filter: 'fuzzyText' },
  { Header: "Værdikort", accessor: "CreditCode", id: "creditCode", filter: 'fuzzyText' },
  { Header: "Bookingdato", accessor: "BookingDate", id: "bookingDate", filter: 'fuzzyText' },
  { Header: "Paymentmethod", accessor: "Paymentmethod", id: "paymentmethod", Filter: SelectColumnFilter, filter: 'includes' },
  { Header: "Promokode", accessor: "Promocode", id: "promocode", filter: 'fuzzyText' },
  { 
    Header: "Total", 
    accessor: "Total",
    id: "total",
    width: 50,
    minWidth: 50,
    align: 'right',
    Filter: NumberRangeColumnFilter,
    filter: 'between',
  },
  { Header: "RC_RR", accessor: "ReturningCustomer", id: "returningCustomer", Filter: SelectColumnFilter, filter: 'includes' },
  { Header: "RC_Th", accessor: "RCForTherapist", id: "rCForTherapist", Filter: SelectColumnFilter, filter: 'includes' },
];

const App = () => {
  // const [orderstatus, setOrderstatus] = useState("All");
  const [data, setData] = useState([]); //table data
  //const dataMemo = useMemo(() => data, [data]);

  useEffect(() => {
    const getData = async () => {
      const homeData = await AuthService.fetch(
        `${AuthService.API_URL}/ui/homeview`
      );
      setData(homeData.data);
      console.log(homeData.data);
    };
    getData();
  }, []);

  return (
    <Page>
      <CssBaseline />
      <Table
        name={'RaskRask - System'}
        columns={columns}
        data={data}
      />
    </Page>
  )
}

export default App
