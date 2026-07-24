import NavbarSetting from '../bundles-component/NavbarSetting'
import NavbarAnalysis from './components/NavbarAnalysis'
import NavbarAnnual from './components/NavbarAnnual'
import NavbarDisposal from './components/NavbarDisposal'
import NavbarInventory from './components/NavbarInventory'
import NavbarOrder from './components/NavbarOrder'
import NavbarScreening from './components/NavbarScreening'
import NavbarTransactions from './components/NavbarTransactions'

const NavbarV2 = () => {
  return (
    <div className="main__nav ui-bg-primary-500 ui-h-10">
      <div className="ui-container ui-mx-auto ui-flex ui-items-center ui-justify-start ui-text-primary-contrast">
        <NavbarScreening />
        <NavbarAnnual />
        <NavbarOrder />
        <NavbarTransactions />
        <NavbarInventory />
        <NavbarDisposal />
        <NavbarAnalysis />
        <NavbarSetting />
      </div>
    </div>
  )
}
export default NavbarV2
