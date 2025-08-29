import { ReportTemplate } from '../types/report'

export const reportTemplates: ReportTemplate[] = [
  {
    id: 'chest-xray-standard',
    name: 'Chest X-Ray Standard Report',
    description: 'Standard template for chest X-ray examinations',
    modality: ['CR', 'DX'],
    isDefault: false,
    sections: [
      {
        id: 'clinical-info',
        title: 'Clinical Information',
        type: 'text',
        required: true,
        order: 1,
        template: 'Clinical Indication: [Enter clinical indication]\nRelevant History: [Enter relevant history]'
      },
      {
        id: 'technique',
        title: 'Technique',
        type: 'text',
        required: true,
        order: 2,
        template: 'PA and lateral chest radiographs were obtained.\nTechnical factors: [Enter technical details]'
      },
      {
        id: 'findings',
        title: 'Findings',
        type: 'findings',
        required: true,
        order: 3
      },
      {
        id: 'measurements',
        title: 'Measurements',
        type: 'measurements',
        required: false,
        order: 4
      },
      {
        id: 'impression',
        title: 'Impression',
        type: 'text',
        required: true,
        order: 5,
        template: '1. [Primary finding]\n2. [Secondary finding]\n3. [Additional observations]'
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        type: 'text',
        required: false,
        order: 6,
        template: 'Consider [additional imaging/clinical correlation] if clinically indicated.'
      },
      {
        id: 'signature',
        title: 'Radiologist Signature',
        type: 'signature',
        required: true,
        order: 7
      }
    ]
  },
  {
    id: 'ct-chest-standard',
    name: 'CT Chest Standard Report',
    description: 'Standard template for CT chest examinations',
    modality: ['CT'],
    isDefault: false,
    sections: [
      {
        id: 'clinical-info',
        title: 'Clinical Information',
        type: 'text',
        required: true,
        order: 1,
        template: 'Clinical Indication: [Enter clinical indication]\nRelevant History: [Enter relevant history]'
      },
      {
        id: 'technique',
        title: 'Technique',
        type: 'text',
        required: true,
        order: 2,
        template: 'CT chest was performed with intravenous contrast.\nSlice thickness: [Enter slice thickness]\nReconstruction: [Enter reconstruction details]'
      },
      {
        id: 'findings',
        title: 'Findings',
        type: 'findings',
        required: true,
        order: 3
      },
      {
        id: 'measurements',
        title: 'Measurements',
        type: 'measurements',
        required: false,
        order: 4
      },
      {
        id: 'impression',
        title: 'Impression',
        type: 'text',
        required: true,
        order: 5,
        template: '1. [Primary finding]\n2. [Secondary finding]\n3. [Additional observations]'
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        type: 'text',
        required: false,
        order: 6,
        template: 'Consider [additional imaging/clinical correlation] if clinically indicated.'
      },
      {
        id: 'signature',
        title: 'Radiologist Signature',
        type: 'signature',
        required: true,
        order: 7
      }
    ]
  },
  {
    id: 'mri-brain-standard',
    name: 'MRI Brain Standard Report',
    description: 'Standard template for MRI brain examinations',
    modality: ['MR'],
    isDefault: false,
    sections: [
      {
        id: 'clinical-info',
        title: 'Clinical Information',
        type: 'text',
        required: true,
        order: 1,
        template: 'Clinical Indication: [Enter clinical indication]\nRelevant History: [Enter relevant history]'
      },
      {
        id: 'technique',
        title: 'Technique',
        type: 'text',
        required: true,
        order: 2,
        template: 'MRI brain was performed with the following sequences:\n- T1 weighted images\n- T2 weighted images\n- FLAIR images\n- Diffusion weighted images\n- Post-contrast T1 weighted images'
      },
      {
        id: 'findings',
        title: 'Findings',
        type: 'findings',
        required: true,
        order: 3
      },
      {
        id: 'measurements',
        title: 'Measurements',
        type: 'measurements',
        required: false,
        order: 4
      },
      {
        id: 'impression',
        title: 'Impression',
        type: 'text',
        required: true,
        order: 5,
        template: '1. [Primary finding]\n2. [Secondary finding]\n3. [Additional observations]'
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        type: 'text',
        required: false,
        order: 6,
        template: 'Consider [additional imaging/clinical correlation] if clinically indicated.'
      },
      {
        id: 'signature',
        title: 'Radiologist Signature',
        type: 'signature',
        required: true,
        order: 7
      }
    ]
  },
  {
    id: 'ultrasound-abdomen',
    name: 'Ultrasound Abdomen Report',
    description: 'Standard template for abdominal ultrasound examinations',
    modality: ['US'],
    isDefault: false,
    sections: [
      {
        id: 'clinical-info',
        title: 'Clinical Information',
        type: 'text',
        required: true,
        order: 1,
        template: 'Clinical Indication: [Enter clinical indication]\nRelevant History: [Enter relevant history]'
      },
      {
        id: 'technique',
        title: 'Technique',
        type: 'text',
        required: true,
        order: 2,
        template: 'Abdominal ultrasound was performed using a [transducer type] transducer.\nPatient preparation: [Enter preparation details]'
      },
      {
        id: 'findings',
        title: 'Findings',
        type: 'findings',
        required: true,
        order: 3
      },
      {
        id: 'measurements',
        title: 'Measurements',
        type: 'measurements',
        required: false,
        order: 4
      },
      {
        id: 'impression',
        title: 'Impression',
        type: 'text',
        required: true,
        order: 5,
        template: '1. [Primary finding]\n2. [Secondary finding]\n3. [Additional observations]'
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        type: 'text',
        required: false,
        order: 6,
        template: 'Consider [additional imaging/clinical correlation] if clinically indicated.'
      },
      {
        id: 'signature',
        title: 'Radiologist Signature',
        type: 'signature',
        required: true,
        order: 7
      }
    ]
  },
  {
    id: 'custom-template',
    name: 'Custom Report Template',
    description: 'Customizable template for various modalities',
    modality: ['*'],
    isDefault: true,
    sections: [
      {
        id: 'clinical-info',
        title: 'Clinical Information',
        type: 'text',
        required: true,
        order: 1,
        template: 'Clinical Indication: [Enter clinical indication]\nRelevant History: [Enter relevant history]'
      },
      {
        id: 'technique',
        title: 'Technique',
        type: 'text',
        required: true,
        order: 2,
        template: 'Technique: [Enter technical details]'
      },
      {
        id: 'findings',
        title: 'Findings',
        type: 'findings',
        required: true,
        order: 3
      },
      {
        id: 'measurements',
        title: 'Measurements',
        type: 'measurements',
        required: false,
        order: 4
      },
      {
        id: 'impression',
        title: 'Impression',
        type: 'text',
        required: true,
        order: 5,
        template: '1. [Primary finding]\n2. [Secondary finding]\n3. [Additional observations]'
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        type: 'text',
        required: false,
        order: 6,
        template: 'Consider [additional imaging/clinical correlation] if clinically indicated.'
      },
      {
        id: 'signature',
        title: 'Radiologist Signature',
        type: 'signature',
        required: true,
        order: 7
      }
    ]
  }
]

export const getTemplateByModality = (modality: string): ReportTemplate => {
  const template = reportTemplates.find(t => 
    t.modality.includes(modality) || t.modality.includes('*')
  )
  return template || reportTemplates.find(t => t.isDefault)!
}

export const getTemplateById = (id: string): ReportTemplate | undefined => {
  return reportTemplates.find(t => t.id === id)
}
