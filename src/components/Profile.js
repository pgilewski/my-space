import React, {useState, useEffect} from 'react';
import useAuth from '../hooks/useAuth';
import avatar from '../assets/images/me.png';
import Container from './Container';
import {useToggle} from "../hooks/useToggle";
import {Auth, API, graphqlOperation} from 'aws-amplify';
import {getProfile} from '../graphql/queries';
import {createProfile, updateProfile} from '../graphql/mutations';

const Profile = (props) => {
    const {user} = props

    const initialState = {
        id: null,
        name: '',
        bio: '',
        socials: null,
    }

    const [profileInfo, setProfileInfo] = useState(initialState);

    const addProfileToDB = async (profile) => {
        const response = await API.graphql(graphqlOperation(createProfile, {input: profile}))
        setProfileInfo(response.data.createProfile)
    }

    const getProfileFromDB = async () => {
        const cognitoUser = await Auth.currentAuthenticatedUser()
        const creds = await Auth.currentCredentials()

        const profile = {
            id: cognitoUser.username,
            email: cognitoUser.attributes.email,
            identityId: creds.identityId,
        }

        await API.graphql(graphqlOperation(getProfile, {id: profile.id})).then((d) => {

            if (d.data.getProfile) {
                setProfileInfo(d.data.getProfile)
                console.log(profileInfo)
            } else {
                addProfileToDB(profile)
            }
        })


    }

    async function updateProfileInDB() {
        const profile = {
            ...profileInfo, ...formState, socials: socialFormList
        }
            delete profile.createdAt;
            delete profile.updatedAt;
            delete profile.owner;




        await API.graphql(graphqlOperation(updateProfile, {input: profile})).then((d) => {
            console.log(profileInfo)
            console.log(d)
            setProfileInfo(d.data.updateProfile);

        })
        console.log("dsds", profileInfo)
        setEditMode(false)

        }

    useEffect(() => {
        getProfileFromDB();
    }, [])

    const [socialForm , setSocialForm] = useState();
    const [socialFormList , setSocialFormList] = useState([]);

    function onChangeSocial(e) {
        e.persist()
        setSocialForm(() => ({...socialForm, [e.target.name]: e.target.value }))
    }

    const addSocial = (e) => {
        setSocialFormList(() => ([...socialFormList, socialForm]))
        console.log(socialFormList)

    }

    const renderSocials = () => {

        if (profileInfo.socials ==! null) {
            return (
                <div>
                    {
                        profileInfo.socials.map((social, i) => {
                            console.log(social)
                            return (
                                <div key={i}>
									<span
                                        className="flex mr-2 background-gray-800 inline-flex items-center  leading-sm  px-3 py-1 rounded-full bg-white text-gray-700 border">
										<a href={social.website}
                                           className="cursor-pointer leading-4 text-indigo-500 text-xs">
									        {social.name}
										</a>
										<svg onClick={() => console.log("remove")}
                                             className="ml-1 cursor-pointer"
                                             xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                             width="12" height="12"
                                             viewBox="0 0 24 24"
                                        ><path
                                            d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"></path></svg>
									</span>
                                </div>
                            )
                        })}

                </div>
            )
        } else {
            return (editMode ? <div className="flex mt-2">
{/*                <div className="flex ">
                    <input onChange={onChangeSocial}
                           type="text"
                           name="social"
                           className=" rounded flex-1 appearance-none border border-gray-300 w-full px-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                           placeholder="social name"/>
                    <input onChange={onChangeSocial}
                           name="url"
                           type="text"
                           className="ml-2 rounded flex-1 appearance-none border border-gray-300 w-full px-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                           placeholder="https://site.com"/>
                </div>

                <button
                    onClick={addSocial}
                    className="ml-1 px-2 rounded border hover:bg-gray-100 appearance-none border-gray-300 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                    Add social
                </button>*/}
            </div> : null)
        }
    }

    const [editMode, setEditMode] = useToggle();
    const [formState, setFormState] = useState()

    function onChange(e) {
        e.persist()
        setFormState(() => ({...formState, [e.target.name]: e.target.value }))
        console.log(formState)
    }

    return (
        <Container>
            <div className="p-4">
                <div>
                    <div
                        className="w-full bg-cover bg-no-repeat bg-center"
                        style={{
                            height: '200px',
                            backgroundImage: 'url(https://wallpapercave.com/wp/wp2771916.jpg)'
                        }}
                    >
                        <img
                            className="opacity-0 w-full h-full"
                            src="https://wallpapercave.com/wp/wp2771916.jpg"
                            alt=""
                        />
                    </div>
                    <div className="p-4">
                        <div className="relative flex w-full">
                            <div className="flex flex-1">
                                <div style={{marginTop: '-6rem'}}>
                                    <div
                                        style={{height: '9rem', width: '9rem'}}
                                        className="md relative avatar"
                                    >
                                        <img
                                            className="md relative border-4 border-gray-900 w-36"
                                            src={avatar}
                                            alt="avatar"
                                        />
                                        <div className="absolute"/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col text-right">
                                <button onClick={setEditMode}
                                        className="flex justify-center  max-h-max whitespace-nowrap focus:outline-none  focus:ring  rounded max-w-max border bg-transparent border-indigo-500 text-indigo-500 hover:border-indigo-800 hover:border-indigo-800 flex items-center hover:shadow-lg font-bold py-2 px-4  mr-0 ml-auto">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className="w-full mt-2 text-left">
                            <div>
                                {editMode ? <input onChange={onChange} name="name" id="name" placeholder={profileInfo.name}/> :
                                    <h2 className="text-xl leading-6 font-bold">{profileInfo.name}</h2>
                                }
                            </div>
                            <div className="mt-2">
                                {
                                    editMode ? <textarea onChange={onChange} className="w-full" name="bio" id="bio" placeholder={profileInfo.bio}/> :
                                        <p className="mb-2 text-left">{profileInfo.bio}
                                        </p>
                                }

                                {renderSocials()}


                            </div>

                            <div className="pt-3 flex flex-col justify-start items-start w-full ">


                                {/*								<div className="relative text-left ">
									<label htmlFor="name-with-label" className="text-gray-700 ml-2">
										User
									</label>
									<input type="text" id="name-with-label"
										   className="rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
										   name="email" placeholder=""/>
								</div>*/}

                                {/*								<div className=" relative opacity-50 pointer-events-none text-left">
									<label htmlFor="disabled-email" className="text-gray-700 ml-2">
										Email
									</label>
									<input type="text" id="disabled-email" disabled=""
										   className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
										   name="email" placeholder={name.email} disabled/>
								</div>*/}

                            </div>
                        </div>
                        <div className="text-left">
                             {profileInfo.createdAt ? "Created at: " + profileInfo.createdAt.split("T")[0] : null}
                        </div>
                    </div>

                </div>
                <div className="flex w-full justify-right">
                    <button
                        onClick={updateProfileInDB}
                        className="ml-auto py-2 px-4  mr-4 lex justify-center  max-h-max whitespace-nowrap focus:outline-none  focus:ring  rounded max-w-max border bg-transparent border-green-500 text-green-500 hover:border-green-800 hover:border-green-800 flex items-center hover:shadow-lg font-bold">
                        Save
                    </button>
                </div>
            </div>

        </Container>
    );
};

export default Profile;