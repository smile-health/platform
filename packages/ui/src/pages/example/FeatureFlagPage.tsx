import {
  FeatureString,
  IfFeatureEnabled,
  useFeature,
  useFeatureIsOn,
  useFeatureValue,
} from '@growthbook/growthbook-react'

export default function FeatureFlagPage() {
  const isFontSizeEnabled = useFeatureIsOn('feature_flag.number.font_size')
  const fontSizeValue = useFeatureValue('feature_flag.number.font_size', 10)
  const fontSize = useFeature('feature_flag.number.font_size')

  console.log({ fontSize })

  return (
    <>
      <IfFeatureEnabled feature="feature_flag.string.font_type">
        <p>Font Family Flag is On</p>
      </IfFeatureEnabled>
      <div className="flex gap-1">
        <p>Font Family:</p>
        <FeatureString
          feature="feature_flag.string.font_type"
          default="Arial"
        />
      </div>
      {isFontSizeEnabled ? <p>Font Size: {fontSizeValue}</p> : null}
    </>
  )
}
