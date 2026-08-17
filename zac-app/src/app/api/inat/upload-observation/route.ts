import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;
    const taxonId = formData.get('taxon_id') as string;
    const observedOnString = formData.get('observed_on_string') as string;
    const placeGuess = formData.get('place_guess') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const description = formData.get('description') as string;
    const projectId = formData.get('project_id') as string;
    const file = formData.get('file') as Blob | null;

    if (!token) {
      return NextResponse.json({ error: 'iNaturalist API token (JWT) is required' }, { status: 400 });
    }

    // Step 1: Create Observation metadata on iNaturalist
    const obsPayload: Record<string, any> = {
      observation: {
        taxon_id: taxonId ? parseInt(taxonId, 10) : undefined,
        observed_on_string: observedOnString || undefined,
        place_guess: placeGuess || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        description: description || undefined,
      }
    };

    console.log('[iNat Upload] Submitting observation metadata:', obsPayload);

    const obsRes = await fetch('https://api.inaturalist.org/v1/observations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'ZAC-Conservation-App/1.0',
      },
      body: JSON.stringify(obsPayload),
    });

    if (!obsRes.ok) {
      const errorText = await obsRes.text();
      console.error('[iNat Upload] Observation creation failed:', errorText);
      return NextResponse.json({ error: `iNaturalist API Error: ${errorText || obsRes.statusText}` }, { status: obsRes.status });
    }

    const obsData = await obsRes.json();
    const observationId = obsData.results?.[0]?.id;

    if (!observationId) {
      return NextResponse.json({ error: 'Failed to retrieve observation ID from iNaturalist response.' }, { status: 500 });
    }

    console.log('[iNat Upload] Observation created successfully. ID:', observationId);

    let photoUploaded = false;
    let photoError = null;

    // Step 2: Upload Photo if provided
    if (file && file.size > 0) {
      console.log('[iNat Upload] Uploading photo file to observation...');
      try {
        const imageFormData = new FormData();
        imageFormData.append('observation_photo[observation_id]', String(observationId));
        imageFormData.append('file', file);

        const photoRes = await fetch('https://api.inaturalist.org/v1/observation_photos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'ZAC-Conservation-App/1.0',
          },
          body: imageFormData,
        });

        if (photoRes.ok) {
          photoUploaded = true;
          console.log('[iNat Upload] Photo uploaded successfully.');
        } else {
          photoError = await photoRes.text();
          console.error('[iNat Upload] Photo upload failed:', photoError);
        }
      } catch (e: any) {
        photoError = e.message || String(e);
        console.error('[iNat Upload] Exception during photo upload:', e);
      }
    }

    let projectLinked = false;
    let projectError = null;

    // Step 3: Link to project if provided
    if (projectId) {
      console.log('[iNat Upload] Linking observation to project:', projectId);
      try {
        const projRes = await fetch('https://api.inaturalist.org/v1/project_observations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'ZAC-Conservation-App/1.0',
          },
          body: JSON.stringify({
            project_observation: {
              observation_id: observationId,
              project_id: parseInt(projectId, 10),
            }
          }),
        });

        if (projRes.ok) {
          projectLinked = true;
          console.log('[iNat Upload] Linked to project successfully.');
        } else {
          projectError = await projRes.text();
          console.error('[iNat Upload] Project linkage failed:', projectError);
        }
      } catch (e: any) {
        projectError = e.message || String(e);
        console.error('[iNat Upload] Exception during project linkage:', e);
      }
    }

    return NextResponse.json({
      success: true,
      observationId,
      url: `https://www.inaturalist.org/observations/${observationId}`,
      photoUploaded,
      photoError,
      projectLinked,
      projectError,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API /api/inat/upload-observation]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
