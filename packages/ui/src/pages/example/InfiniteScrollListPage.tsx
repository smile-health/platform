import { MaterialInfiniteScrollList } from '#pages/material/components/MaterialInfiniteScrollList'

const InfiniteScrollListPage = () => {
  return (
    <div className="ui-px-20 ui-space-y-4 p-5">
      <div className="ui-border ui-rounded-lg ui-p-4 ui-space-y-4">
        <div className="ui-font-semibold">Regular</div>
        <MaterialInfiniteScrollList columns={['name', 'current-stock']} />
      </div>

      <div className="ui-border ui-rounded-lg ui-p-4 ui-space-y-4">
        <div className="ui-font-semibold">Without Search Bar</div>
        <MaterialInfiniteScrollList
          config={{
            showSearchBar: false,
          }}
        />
      </div>

      <div className="ui-border ui-rounded-lg ui-p-4 ui-space-y-4">
        <div className="ui-font-semibold">Clickable</div>
        <MaterialInfiniteScrollList onClickItem={(item) => console.log(item)} />
      </div>
    </div>
  )
}

export default InfiniteScrollListPage
