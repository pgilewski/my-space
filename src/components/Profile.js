/**
 * TODO:
 * -
 * -
 */

import React, { useState, useEffect, useRef } from 'react'
import avatar from '../assets/images/avatar-placeholder.jpg'
import background from '../assets/images/SM-placeholder.png'
import { useToggle } from '../hooks/useToggle'
import { Auth, API, Storage, graphqlOperation } from 'aws-amplify'
import { getProfile } from '../graphql/queries'
import { createProfile, updateProfile } from '../graphql/mutations'
import awsmobile from '../aws-exports'

const Profile = (props) => {
  const initialState = {
    id: null,
    name: '',
    bio: '',
    socials: null,
    avatar: null,
    background: null,
  }

  const [profileInfo, setProfileInfo] = useState(initialState)

  const addProfileToDB = async (profile) => {
    try {
      await API.graphql(
        graphqlOperation(createProfile, { input: profile }),
      ).then((d) => {
        setProfileInfo(d.data.createProfile)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function updateProfileInDB() {
    const creds = await Auth.currentCredentials()
    if (backgroundPicture.data) {
      try {
        await Storage.put(backgroundPicture.name, backgroundPicture.data, {
          contentType: 'image/*',
          level: 'protected',
        }).then((d) => {
          console.log('background uploaded successfully', d)
        })
      } catch (error) {
        console.error('Error uploading file: ', error)
      }
    }
    if (avatarPicture.data) {
      try {
        await Storage.put(avatarPicture.name, avatarPicture.data, {
          contentType: 'image/*',
          level: 'protected',
        }).then((d) => {
          console.log('avatar uploaded successfully', d)
        })
      } catch (error) {
        console.error('Error uploading file: ', error)
      }
    }

    const profile = {
      ...profileInfo,
      ...formState,
      socials: socialFormList,

      profilePic: {
        bucket: awsmobile.aws_user_files_s3_bucket,
        region: awsmobile.aws_user_files_s3_bucket_region,
        key: `protected/${creds.identityId}/${avatarPicture.name}`,
      },

      backgroundPic: {
        bucket: awsmobile.aws_user_files_s3_bucket,
        region: awsmobile.aws_user_files_s3_bucket_region,
        key: `protected/${creds.identityId}/${backgroundPicture.name}`,
      },
    }
    delete profile.createdAt
    delete profile.updatedAt
    delete profile.owner

    await API.graphql(graphqlOperation(updateProfile, { input: profile })).then(
      (d) => {
        setProfileInfo(d.data.updateProfile)
      },
    )
    setEditMode(false)
  }

  const getProfileFromDB = async () => {
    const cognitoUser = await Auth.currentAuthenticatedUser()
    const creds = await Auth.currentCredentials()

    const profile = {
      id: cognitoUser.username,
      email: cognitoUser.attributes.email,
      identityId: creds.identityId,
    }
    try {
      const response = await API.graphql(
        graphqlOperation(getProfile, { id: profile.id }),
      )
      if (response.data.getProfile === null) {
        addProfileToDB(profile)
      } else {
        try {
          const backgroundPicKey = response.data.getProfile.backgroundPic.key.split(
            '/',
          )[2]
          const profilePicKey = response.data.getProfile.profilePic.key.split(
            '/',
          )[2]

          if (response.data.getProfile.backgroundPic && backgroundPicKey) {
            Storage.get(backgroundPicKey, {
              level: 'protected',
            }).then((d) => {
              console.log('obrazek', d)

              setBackgroundPicture({
                src: d,
                name: backgroundPicKey,
              })
            })
          } else {
            /*             setBackgroundPicture({
              name: '',
              src: background,
            }) */
          }
          if (response.data.getProfile.profilePic && profilePicKey) {
            await Storage.get(profilePicKey, {
              level: 'protected',
            }).then((d) => {
              console.log('obrazek', d)
              setAvatarPicture({
                src: d,
                name: profilePicKey,
              })
            })
          } else {
            /*             setAvatarPicture({
              name: '',
              src: avatar,
            }) */
          }
        } catch (error) {
          console.log('we couldnt download image.', error)
        }
        setProfileInfo(response.data.getProfile)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getProfileFromDB()
  }, [])

  const [socialForm, setSocialForm] = useState()
  const [socialFormList, setSocialFormList] = useState([])

  function onChangeSocial(e) {
    e.persist()
    setSocialForm(() => ({ ...socialForm, [e.target.name]: e.target.value }))
  }

  const addSocial = (e) => {
    setSocialFormList(() => [...socialFormList, socialForm])
  }

  const renderSocials = () => {
    if (profileInfo.socials === !null) {
      return (
        <div>
          {profileInfo.socials.map((social, i) => {
            return (
              <div key={i}>
                <span className="mr-2 background-gray-800 inline-flex items-center  leading-sm  px-3 py-1 rounded-full bg-white text-gray-700 border">
                  <a
                    href={social.website}
                    className="cursor-pointer leading-4 text-indigo-500 text-xs"
                  >
                    {social.name}
                  </a>
                  <svg
                    onClick={() => console.log('remove')}
                    className="ml-1 cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                  >
                    <path d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"></path>
                  </svg>
                </span>
              </div>
            )
          })}
        </div>
      )
    } else {
      return editMode ? (
        <div className="flex mt-2">
          {/* <div className="flex ">
             <input
               onChange={onChangeSocial}
               type="text"
               name="social"
               className=" rounded flex-1 appearance-none border border-gray-300 w-full px-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
               placeholder="e.g facebook"
             />
             <input
               onChange={onChangeSocial}
               name="url"
               type="text"
               className="ml-2 rounded flex-1 appearance-none border border-gray-300 w-full px-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
               placeholder="https://facebook.com/your_account"
             />
           </div>
 
           <button
             onClick={addSocial}
             className="ml-1 rounded border hover:bg-gray-100 appearance-none border-gray-300 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
           >
             Add social
           </button> */}
        </div>
      ) : null
    }
  }

  const [editMode, setEditMode] = useToggle()
  const [formState, setFormState] = useState()

  function onChange(e) {
    e.persist()
    setFormState(() => ({ ...formState, [e.target.name]: e.target.value }))
  }

  const [backgroundPicture, setBackgroundPicture] = useState({
    name: '',
    src: background,
    data: null,
  })

  const [avatarPicture, setAvatarPicture] = useState({
    name: '',
    src: avatar,
    data: null,
  })

  async function onBackgroundChangeCapture(e) {
    if (e.target.files[0]) {
      setBackgroundPicture({
        src: URL.createObjectURL(e.target.files[0]),
        name: e.target.files[0].name,
        data: e.target.files[0],
      })
    }
  }

  function onAvatarChangeCapture(e) {
    if (e.target.files[0]) {
      setAvatarPicture({
        src: URL.createObjectURL(e.target.files[0]),
        name: e.target.files[0].name,
        data: e.target.files[0],
      })
    }
  }

  const backgroundInput = useRef(null)

  const onBackgroundClick = () => {
    backgroundInput.current.click()
  }
  const avatarInput = useRef(null)

  const onAvatarClick = () => {
    avatarInput.current.click()
  }

  useEffect(() => {
    // storing input name
    const color = localStorage.getItem('backgroundColor')
    console.log(color)
    setBackgroundColor(color)
  }, [])

  const [backgroundColor, setBackgroundColor] = useState()
  const backgroundColorChange = (e) => {
    const color = e.target.value
    setBackgroundColor(color)
    console.log(color)

    localStorage.setItem('backgroundColor', backgroundColor)
  }

  return (
    <div
      className="full-height-no-navbar"
      style={{ backgroundColor: backgroundColor }}
    >
      <div className=" mt-2 max-w-screen-lg glass-card min mx-auto w-full">
        <div className="p-4">
          <div>
            <div
              className="w-full bg-cover bg-no-repeat bg-center"
              style={{
                height: '200px',
                backgroundImage: `url(${backgroundPicture.src})`,
              }}
            >
              <input
                type="file"
                ref={backgroundInput}
                onChangeCapture={onBackgroundChangeCapture}
                accept="image/*"
                style={{ display: 'none' }}
                disabled={!editMode}
                multiple={false}
              />
              <img
                onClick={onBackgroundClick}
                className="opacity-0 w-full h-full"
                src={backgroundPicture.src}
                alt=""
              />
            </div>
            <div className="p-4">
              <div className="relative flex w-full">
                <div className="flex flex-1">
                  <div style={{ marginTop: '-6rem' }}>
                    <div
                      style={{ height: '9rem', width: '9rem' }}
                      className="md relative avatar"
                    >
                      <input
                        type="file"
                        ref={avatarInput}
                        onChange={onAvatarChangeCapture}
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="avatar-file"
                        disabled={!editMode}
                        multiple={false}
                      />
                      <img
                        onClick={onAvatarClick}
                        className="md relative border-2 border-gray-300 w-36"
                        src={avatarPicture.src}
                        alt="avatar"
                      />
                      <div className="absolute" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <button
                    onClick={setEditMode}
                    className="justify-center  max-h-max whitespace-nowrap focus:outline-none  focus:ring  rounded max-w-max border bg-transparent border-indigo-500 text-indigo-500 hover:border-indigo-800 hover:border-indigo-800 flex items-center hover:shadow-lg font-bold py-2 px-4  mr-0 ml-auto"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="w-full mt-2 text-left">
                <div>
                  {editMode ? (
                    <input
                      className="bg-gray-200"
                      onChange={onChange}
                      name="name"
                      id="name"
                      placeholder={profileInfo.name ? profileInfo.name : null}
                    />
                  ) : (
                    <h2 className="text-xl leading-6 font-bold">
                      {profileInfo.name ? profileInfo.name : null}
                    </h2>
                  )}
                </div>
                <div className="mt-2">
                  {editMode ? (
                    <textarea
                      onChange={onChange}
                      className="w-full bg-gray-200"
                      name="bio"
                      id="bio"
                      placeholder={profileInfo.bio ? profileInfo.bio : null}
                    />
                  ) : (
                    <p className="mb-2 text-left">
                      {profileInfo.bio ? profileInfo.bio : null}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-left">
                <div>
                  {profileInfo.createdAt
                    ? 'Created at: ' + profileInfo.createdAt.split('T')[0]
                    : null}
                </div>

                <input
                  type="color"
                  className="mt-2"
                  onChange={backgroundColorChange}
                  value={backgroundColor}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full justify-right">
            {editMode ? (
              <button
                onClick={updateProfileInDB}
                className="ml-auto py-2 px-4  mr-4 lex justify-center  max-h-max whitespace-nowrap focus:outline-none  focus:ring  rounded max-w-max border bg-transparent border-green-500 text-green-500 hover:border-green-800 hover:border-green-800 flex items-center hover:shadow-lg font-bold"
              >
                Save
              </button>
            ) : null}
          </div>
          <hr className="border border-gray-400 my-4 mx-8" />
        </div>
      </div>
    </div>
  )
}

export default Profile
