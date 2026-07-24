import React from 'react'
import Link from 'next/link'
import ChevronRight from '#components/icons/ChevronRight'

const NavbarOverviewLink = () => {
  return (
    <>
      <Link
        href={`/v5/dashboard/inventory-overview`}
        className="ui-block ui-h-full ui-w-full"
      >
        <div className="ui-text-dark-teal menu__overview ui-mt-2 ui-flex ui-cursor-pointer ui-items-center ui-justify-start ui-p-2">
          <div className="ui-h-full ui-w-full ui-text-lg">Overview</div>
          <ChevronRight />
        </div>
      </Link>

      <style>{`
        .menu__overview {
          background-color: transparent;
          color: initial;
          transition:
            background-color 300ms ease-in-out,
            color 300ms ease-in-out;
        }

        .menu__overview:hover {
          background-color: #e8f2fc;
        }
      `}</style>
    </>
  )
}

export default NavbarOverviewLink
