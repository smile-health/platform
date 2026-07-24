import { Spinner } from "#components/spinner";
import cx from "#lib/cx";
import { AnimatePresence, motion } from "framer-motion";

function DataTableLoader({ show = true }: Readonly<{ show?: boolean }>) {
  return (
    <AnimatePresence>
      {show ? (
        <div className="ui-absolute ui-inset-0 ui-flex ui-justify-center">
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 0.4,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, ease: 'easeIn' },
            }}
            className={cx(
              'ui-absolute ui-inset-0',
              'ui-bg-white',
              'ui-flex ui-h-full ui-w-full ui-justify-center'
            )}
          ></motion.div>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, ease: 'easeIn' },
            }}
            className="ui-z-10 ui-my-auto ui-h-8 ui-w-8 ui-text-primary-500 ui-opacity-100"
          >
            <Spinner />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default DataTableLoader
