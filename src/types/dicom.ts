export interface Instance {
  ID: string
  FileSize: number
  FileUuid: string
  IndexInSeries: number
  Labels: string[]
  MainDicomTags: {
    AcquisitionNumber?: string
    InstanceCreationDate?: string
    InstanceCreationTime?: string
    InstanceNumber?: string
    NumberOfFrames?: string
    SOPInstanceUID?: string
  }
  ParentSeries: string
  Type: string
}

export interface Series {
  ID: string
  MainDicomTags: {
    SeriesDescription?: string
    SeriesNumber?: string
    Modality?: string
    SeriesDate?: string
    SeriesTime?: string
    NumberOfSeriesRelatedInstances?: string
    BodyPartExamined?: string
    ProtocolName?: string
  }
  Instances: string[]
  ParentStudy: string
  Type: string
}

export interface StudyInfo {
  ID: string
  MainDicomTags: {
    StudyDate?: string
    StudyDescription?: string
    PatientName?: string
    PatientID?: string
    ModalitiesInStudy?: string
  }
  Series: string[]
  Instances: string[]
}

export interface Measurement {
  id: string
  type: 'distance' | 'angle' | 'area' | 'roi' | 'ellipse'
  points: { x: number; y: number }[]
  value?: number
  unit?: string
  label?: string
  color: string
}

export interface Annotation {
  id: string
  type: 'text' | 'arrow' | 'circle' | 'rectangle' | 'line'
  position: { x: number; y: number }
  text?: string
  color: string
  size?: number
  points?: { x: number; y: number }[]
}

export interface CurrentImage {
  src: string
  loaded: boolean
  error: boolean
}
