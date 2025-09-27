import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ETARequest {
  appointmentId: number;
  patientLat: number;
  patientLng: number;
  doctorAddress: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { appointmentId, patientLat, patientLng, doctorAddress }: ETARequest = await req.json();

    console.log('Calculating ETA for appointment:', appointmentId);
    console.log('Patient location:', { patientLat, patientLng });
    console.log('Doctor address:', doctorAddress);

    // Call Google Maps Distance Matrix API
    const origin = `${patientLat},${patientLng}`;
    const destination = encodeURIComponent(doctorAddress);
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=driving&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log('Google Maps API response:', data);

    if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
      throw new Error('Unable to calculate route');
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      throw new Error(`Route calculation failed: ${element.status}`);
    }

    // Extract duration in traffic (or regular duration as fallback)
    const duration = element.duration_in_traffic || element.duration;
    const etaMinutes = Math.ceil(duration.value / 60); // Convert seconds to minutes

    console.log('Calculated ETA:', etaMinutes, 'minutes');

    // Update or insert tracking data
    const { error: trackingError } = await supabase
      .from('realtime_tracking')
      .upsert({
        appointment_id: appointmentId,
        patient_location_lat: patientLat,
        patient_location_lng: patientLng,
        eta_minutes: etaMinutes,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'appointment_id'
      });

    if (trackingError) {
      console.error('Error updating tracking data:', trackingError);
      throw trackingError;
    }

    // Update appointment status to 'on-way'
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({ status: 'on-way' })
      .eq('id', appointmentId);

    if (appointmentError) {
      console.error('Error updating appointment status:', appointmentError);
      throw appointmentError;
    }

    console.log('Successfully updated tracking and appointment data');

    return new Response(JSON.stringify({
      success: true,
      etaMinutes,
      distance: element.distance.text,
      duration: duration.text
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in calculate-eta function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});