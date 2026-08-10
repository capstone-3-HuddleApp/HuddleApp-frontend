export default function Profile({ user, getLocation, geolocation }) {
  return (
    <>
      <p>{user.username}</p>
      <>
        <button onClick={getLocation}>Get My Location</button>
        {geolocation && (
          <p>
            Lat: {geolocation.latitude}, Lon: {geolocation.longitude}
          </p>
        )}
      </>
    </>
  );
}
