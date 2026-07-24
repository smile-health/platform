import React, { useState } from 'react'
import { PencilIcon } from '@heroicons/react/24/solid'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from '#components/accordion'
import { Badge } from '#components/badge'
import { Button } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import { Checkbox } from '#components/checkbox'
import { CircularProgress } from '#components/circular-progress'
import { CloseButton } from '#components/close-button'
import { DatePicker } from '#components/date-picker'
import { FormControl, FormLabel } from '#components/form-control'
import { Indicator } from '#components/indicator'
import {
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalRoot,
} from '#components/modal'
import { Pagination, PaginationContainer } from '#components/pagination'
import { Radio } from '#components/radio'
import { ReactSelect } from '#components/react-select'
import { Switch } from '#components/switch'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { useLoadingPopupStore } from '#store/loading.store'

const PlaygroundPage = () => {
  const { setLoadingPopup } = useLoadingPopupStore()
  const [page, setCurrentPage] = useState(1)
  const [value, setValue] = useState<unknown>(null)
  const [checked, setChecked] = useState(false)
  const [open, setOpen] = useState(false)
  const colors = [
    'primary',
    'secondary',
    'success',
    'warning',
    'info',
    'danger',
    'neutral',
  ] as const
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
    { label: 'Option 4', value: '4' },
    { label: 'Option 5', value: '5' },
    { label: 'Option 6', value: '6' },
    { label: 'Option 7', value: '7' },
    { label: 'Option 8', value: '8' },
    { label: 'Option 9', value: '9' },
    { label: 'Option 10', value: '10' },
  ] as const

  const handleShowLoading = () => {
    setLoadingPopup(true)

    setTimeout(() => {
      setLoadingPopup(false)
    }, 2000)
  }

  return (
    <div className="m-3 flex flex-col gap-3">
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Accordion</h1>
        <AccordionRoot className="AccordionRoot" type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible prod?</AccordionTrigger>
            <AccordionContent>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industrys standard dummy text
              ever since the 1500s
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Is it unstyled?</AccordionTrigger>
            <AccordionContent>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industrys standard dummy text
              ever since the 1500s
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can it be animated?</AccordionTrigger>
            <AccordionContent>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industrys standard dummy text
              ever since the 1500s
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Avatar</h1>
        <div className="space-y-2">
          {colors.map((item) => (
            <div key={item} className="space-x-5">
              <Badge color={item} variant="solid">
                solid
              </Badge>
              <Badge color={item} variant="light">
                light
              </Badge>
              <Badge color={item} variant="light-outline">
                light-outline
              </Badge>
              <Badge color={item} variant="outline">
                outline
              </Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Button</h1>
        <div className="space-x-3 p-4">
          <Button variant="solid">Solid</Button>
          <Button variant="light">Light</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="default">Default</Button>
        </div>

        <div className="space-x-3 p-4">
          <Button variant="solid" color="secondary">
            Solid secondary
          </Button>
          <Button variant="light" color="secondary">
            Light secondary
          </Button>
          <Button variant="outline" color="secondary">
            Outline secondary
          </Button>
          <Button variant="subtle" color="secondary">
            Subtle secondary
          </Button>
          <Button variant="default" color="secondary">
            Default secondary
          </Button>
        </div>

        <div className="space-x-3 p-4">
          <Button variant="solid" disabled>
            Solid disabled
          </Button>
          <Button variant="light" disabled>
            Light disabled
          </Button>
          <Button variant="outline" disabled>
            Outline disabled
          </Button>
          <Button variant="subtle" disabled>
            Subtle disabled
          </Button>
          <Button variant="default" disabled>
            Default disabled
          </Button>
        </div>

        <div className="space-x-3 p-4">
          <Button variant="solid" loading>
            Solid loading
          </Button>
          <Button variant="light" loading>
            Light loading
          </Button>
          <Button variant="outline" loading>
            Outline loading
          </Button>
          <Button variant="subtle" loading>
            Subtle loading
          </Button>
          <Button variant="default" loading>
            Default loading
          </Button>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Button Icon</h1>
        <div className="flex space-x-3">
          <ButtonIcon variant="solid">
            <PencilIcon className="h-4 w-4"></PencilIcon>
          </ButtonIcon>
          <ButtonIcon variant="light">
            <PencilIcon className="h-4 w-4"></PencilIcon>
          </ButtonIcon>
          <ButtonIcon variant="outline">
            <PencilIcon className="h-4 w-4"></PencilIcon>
          </ButtonIcon>
          <ButtonIcon variant="subtle">
            <PencilIcon className="h-4 w-4"></PencilIcon>
          </ButtonIcon>
          <ButtonIcon variant="default">
            <PencilIcon className="h-4 w-4"></PencilIcon>
          </ButtonIcon>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Checkbox</h1>
        <div className="flex flex-wrap gap-5">
          <Checkbox label="disabled" name="name" value="1" disabled></Checkbox>
          <Checkbox label="enable" name="name" value="1"></Checkbox>
          <Checkbox
            label="disabled checked"
            checked
            name="name"
            value="1"
            disabled
          ></Checkbox>
          <Checkbox
            label="enable checked"
            name="name"
            checked
            value="2"
          ></Checkbox>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Circular Progress</h1>
        <div className="space-y-5">
          <CircularProgress size="xs" value={50}></CircularProgress>
          <CircularProgress size="sm" value={50}></CircularProgress>
          <CircularProgress size="md" value={50}></CircularProgress>
          <CircularProgress size="lg" value={50}></CircularProgress>
          <CircularProgress size="xl" value={50}></CircularProgress>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Circular Progress</h1>
        <div className="flex gap-3">
          <CloseButton size="sm"></CloseButton>
          <CloseButton size="md"></CloseButton>
          <CloseButton size="lg"></CloseButton>
          <CloseButton size="xl"></CloseButton>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Date Picker</h1>
        <div className="space-y-3">
          <FormControl>
            <FormLabel>Disabled</FormLabel>
            <DatePicker isDisabled></DatePicker>
          </FormControl>
          <FormControl>
            <FormLabel>Error</FormLabel>
            <DatePicker error></DatePicker>
          </FormControl>
          <FormControl>
            <FormLabel>Read Only</FormLabel>
            <DatePicker isReadOnly></DatePicker>
          </FormControl>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Indicator</h1>
        <div className="flex flex-wrap gap-5">
          <Indicator color="primary">
            <div className="rounded h-20 w-20  bg-gray-300"></div>
          </Indicator>
          <Indicator color="secondary">
            <div className="rounded h-20 w-20  bg-gray-300"></div>
          </Indicator>
          <Indicator color="success">
            <div className="rounded h-20 w-20  bg-gray-300"></div>
          </Indicator>
          <Indicator color="danger">
            <div className="rounded h-20 w-20  bg-gray-300"></div>
          </Indicator>
          <Indicator color="warning">
            <div className="rounded h-20 w-20  bg-gray-300"></div>
          </Indicator>
          <Indicator color="info">
            <div className="rounded h-20 w-20  bg-gray-300"></div>
          </Indicator>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Pagination</h1>
        <PaginationContainer>
          <Pagination
            totalPages={10}
            currentPage={page}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </PaginationContainer>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Radio</h1>
        <div className="flex flex-wrap gap-5">
          <Radio checked={false} label="unchecked" value="1"></Radio>
          <Radio checked label="checked" value="2"></Radio>
          <Radio disabled label="disabled" value="3"></Radio>
          <Radio checked disabled label="disabled checked" value="3"></Radio>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Select</h1>
        <ReactSelect
          placeholder="Select Option"
          value={value}
          onChange={setValue}
          isClearable
          options={options}
        />
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Switch</h1>
        <div className="space-x-5">
          <Switch size="md" checked={false} label="unchecked"></Switch>
          <Switch
            id="switch-1"
            size="md"
            disabled
            label="disabled unchecked"
          ></Switch>

          <Switch size="md" checked label="checked"></Switch>

          <Switch size="md" checked disabled label="disable checked"></Switch>

          <Switch
            size="md"
            label="label inside"
            labelInside={{ on: 'On', off: 'Off' }}
            checked={checked}
            onCheckedChange={() => setChecked(!checked)}
          ></Switch>
        </div>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Tabs</h1>
        <TabsRoot defaultValue="tab1" variant="default">
          <TabsList>
            <TabsTrigger value="tab1">General</TabsTrigger>
            <TabsTrigger value="tab2">Account</TabsTrigger>
            <TabsTrigger value="tab3">Setting</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">General Content</TabsContent>
          <TabsContent value="tab2">Account Content</TabsContent>
          <TabsContent value="tab3">Setting Content</TabsContent>
        </TabsRoot>
      </div>
      <div className="space-x-2">
        <h1 className="text-2xl font-bold">Loading Popup</h1>
        <Button
          variant="solid"
          type="button"
          onClick={() => handleShowLoading()}
        >
          Show Loading
        </Button>
      </div>
      <div className="ui-space-y-2">
        <h1 className="text-2xl font-bold">Date Picker</h1>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <ModalRoot open={open} setOpen={setOpen} closeOnOverlayClick={false}>
          <ModalCloseButton />
          <ModalHeader>Test Date Picker</ModalHeader>
          <ModalContent>
            <DatePicker id="production-date" data-testid="production-date" />
          </ModalContent>
        </ModalRoot>
      </div>
    </div>
  )
}

export default PlaygroundPage
